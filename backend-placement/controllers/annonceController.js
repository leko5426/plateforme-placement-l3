const Annonce = require('../models/Annonce');
const AgentProfile = require('../models/AgentProfile');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const STATUTS_ANNONCE = ['nouvelle', 'en_traitement', 'cloturee'];

// Profil agent de l'utilisateur connecté, seulement s'il a été validé par l'admin
const obtenirAgentValide = async (user) => {
  const agent = await AgentProfile.findOne({ user: user._id });
  return agent && agent.statutValidation === 'valide' ? agent : null;
};

// Un agent peut voir une demande si elle lui est adressée,
// ou si elle est générale et encore disponible (statut "nouvelle")
const annonceAccessiblePourAgent = (annonce, agent) => {
  if (!annonce.agentDestinataire) return annonce.statut === 'nouvelle';
  return annonce.agentDestinataire.toString() === agent._id.toString();
};

// @desc    Créer une annonce et envoyer le lien magique
// @route   POST /api/annonces
// @access  Public
const creerAnnonce = async (req, res) => {
  try {
    const { nomEmployeur, entreprise, emailEmployeur, telephoneEmployeur, titre, description, localisation, criteres, agentSlug, candidateCible } = req.body;

    if (!nomEmployeur || !emailEmployeur || !titre || !description || !localisation) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    let agentDestinataire = null;
    if (agentSlug) {
      const agent = await AgentProfile.findOne({ urlPersonnalisee: agentSlug, statutValidation: 'valide' });
      if (agent) agentDestinataire = agent._id;
    }

    // 1. Chercher ou créer l'utilisateur 'employeur'
    let employeurUser = null;
    if (req.user && req.user.role === 'employeur') {
        employeurUser = req.user._id;
    } else {
        let existingUser = await User.findOne({ email: emailEmployeur });
        if (!existingUser) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            existingUser = await User.create({
                nom: nomEmployeur,
                email: emailEmployeur,
                telephone: telephoneEmployeur,
                password: randomPassword,
                role: 'employeur',
            });
        }
        employeurUser = existingUser._id;
    }

    // 2. Créer l'annonce
    const annonce = await Annonce.create({
      employeur: { nom: nomEmployeur, entreprise, email: emailEmployeur, telephone: telephoneEmployeur },
      employeurUser: employeurUser,
      titre, description, localisation, criteres, agentDestinataire, candidateCible,
    });

    // 3. Générer le jeton JWT pour le lien magique
    const token = jwt.sign({ id: employeurUser }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const lienSuivi = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/suivi-employeur?token=${token}`;

    // 4. Envoyer l'e-mail magique à l'employeur
    const messageHtml = `
      <h2>Bonjour ${nomEmployeur},</h2>
      <p>Votre demande <strong>"${titre}"</strong> a bien été enregistrée.</p>
      <p>Un de nos agents va l'analyser et vous contactera rapidement pour vous proposer des profils.</p>
      <p>Pour suivre l'avancement de votre demande ou consulter l'historique de vos requêtes, cliquez sur votre lien d'accès personnel ci-dessous :</p>
      <a href="${lienSuivi}" target="_blank" style="display:inline-block; padding:12px 24px; background-color:#007bff; color:#ffffff; text-decoration:none; border-radius:6px; margin-top:15px; font-weight:bold;">
        Accéder à mon espace de suivi
      </a>
      <p style="margin-top:20px; font-size: 12px; color: #666;"><em>Ce lien est confidentiel et vous sert de connexion automatique à votre espace sécurisé. Ne le partagez pas.</em></p>
    `;

    await sendEmail({
      to: emailEmployeur,
      subject: 'Confirmation et suivi de votre demande - Aide-Ménagère',
      htmlContent: messageHtml,
    });

    // 5. Notifier l'agent ou l'admin
    if (agentDestinataire) {
      const agent = await AgentProfile.findById(agentDestinataire).populate('user', 'email');
      if (agent && agent.user) {
        await sendEmail({ to: agent.user.email, subject: 'Nouvelle demande de personnel reçue', html: `<p>Une nouvelle demande "<strong>${titre}</strong>" vient d'être publiée par ${nomEmployeur}.</p>` });
      }
    } else if (process.env.ADMIN_EMAIL) {
        await sendEmail({ to: process.env.ADMIN_EMAIL, subject: 'Nouvelle demande de recrutement (générale)', html: `<p>Une nouvelle demande "<strong>${titre}</strong>" vient d'être publiée par ${nomEmployeur} (${emailEmployeur}).</p>` });
    }

    res.status(201).json({ message: 'Annonce créée avec succès', annonce });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Lister les demandes avec les infos de la candidate ciblée et de son user
// @route   GET /api/annonces
// @access  Privé (admin, agent)
const listerAnnonces = async (req, res) => {
  try {
    const filtre = {};

    if (req.user.role === 'agent') {
      const agent = await obtenirAgentValide(req.user);
      if (!agent) {
        return res.status(403).json({ message: 'Ton compte agent doit être validé pour consulter les demandes' });
      }
      filtre.$or = [
        { agentDestinataire: agent._id },
        { agentDestinataire: null, statut: 'nouvelle' },
      ];
    }

    if (STATUTS_ANNONCE.includes(req.query.statut)) filtre.statut = req.query.statut;

    const annonces = await Annonce.find(filtre)
      .populate('agentDestinataire', 'nomAgence urlPersonnalisee')
      .populate({
        path: 'candidateCible',
        select: 'photo ville age user',
        populate: { path: 'user', select: 'nom email' }
      })
      .sort({ createdAt: -1 });

    res.json(annonces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Détail d'une demande
// @route   GET /api/annonces/:id
// @access  Privé (admin, agent concerné)
const obtenirAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });

    if (req.user.role === 'agent') {
      const agent = await obtenirAgentValide(req.user);
      if (!agent || !annonceAccessiblePourAgent(annonce, agent)) {
        return res.status(403).json({ message: 'Accès refusé à cette demande' });
      }
    }

    await annonce.populate('agentDestinataire', 'nomAgence urlPersonnalisee');
    await annonce.populate({
      path: 'candidateCible',
      select: 'photo ville age user',
      populate: { path: 'user', select: 'nom email' }
    });

    res.json(annonce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Changer le statut d'une demande : prise en charge ou clôture
// @route   PUT /api/annonces/:id
// @access  Privé (admin, agent concerné)
const modifierAnnonce = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!['en_traitement', 'cloturee'].includes(statut)) {
      return res.status(400).json({ message: "Statut invalide. Utilisez 'en_traitement' ou 'cloturee'" });
    }

    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });

    if (annonce.statut === 'cloturee') {
      return res.status(400).json({ message: 'Cette demande est déjà clôturée' });
    }

    if (req.user.role === 'admin') {
      annonce.statut = statut;
      await annonce.save();
      return res.json(annonce);
    }

    const agent = await obtenirAgentValide(req.user);
    if (!agent) {
      return res.status(403).json({ message: 'Ton compte agent doit être validé' });
    }

    if (statut === 'en_traitement') {
      const priseEnCharge = await Annonce.findOneAndUpdate(
        {
          _id: annonce._id,
          statut: 'nouvelle',
          $or: [{ agentDestinataire: null }, { agentDestinataire: agent._id }],
        },
        { statut: 'en_traitement', agentDestinataire: agent._id },
        { new: true }
      );

      if (!priseEnCharge) {
        return res.status(409).json({ message: "Cette demande a déjà été prise en charge ou n'est plus disponible" });
      }
      return res.json(priseEnCharge);
    }

    const estProprietaire = annonce.agentDestinataire && annonce.agentDestinataire.toString() === agent._id.toString();
    if (!estProprietaire) {
      return res.status(403).json({ message: "Seule l'agence qui a pris en charge la demande peut la clôturer" });
    }

    annonce.statut = 'cloturee';
    await annonce.save();
    res.json(annonce);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Supprimer une annonce
// @route   DELETE /api/annonces/:id
// @access  Privé (admin)
const supprimerAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findByIdAndDelete(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NOUVELLE FONCTION : Récupérer les annonces de l'employeur connecté
const getMesAnnonces = async (req, res) => {
    try {
        const annonces = await Annonce.find({ employeurUser: req.user._id }).sort({ createdAt: -1 });
        res.json(annonces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  creerAnnonce,
  listerAnnonces,
  obtenirAnnonce,
  modifierAnnonce,
  supprimerAnnonce,
  getMesAnnonces
};