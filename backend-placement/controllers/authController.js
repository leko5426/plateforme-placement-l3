const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AgentProfile = require('../models/AgentProfile');
const CandidateProfile = require('../models/CandidateProfile');
const sendEmail = require('../utils/sendEmail');
const { genererSlugUnique } = require('../utils/generateSlug');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const construireReponseAuth = (user) => ({
  _id: user._id,
  nom: user.nom,
  email: user.email,
  role: user.role,
  emailVerifie: user.emailVerifie, // On retourne cette info au frontend
  token: generateToken(user._id),
});

const supprimerFichiersTeleverses = (files) => {
  Object.values(files || {})
    .flat()
    .forEach((fichier) => fs.unlink(fichier.path, () => {}));
};

// @desc    Inscription d'un agent de placement
// @route   POST /api/auth/register-agent
// @access  Public
const registerAgent = async (req, res) => {
  try {
    const { nom, email, password, telephone, nomAgence, localisation, description } = req.body;

    if (!nom || !email || !password || !nomAgence || !localisation) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Un agent n'a pas besoin du code à 4 chiffres (son compte est validé par l'admin)
    const user = await User.create({ nom, email, password, telephone, role: 'agent', emailVerifie: true });
    const slug = await genererSlugUnique(nomAgence);

    const agentProfile = await AgentProfile.create({
      user: user._id,
      nomAgence,
      localisation,
      description,
      urlPersonnalisee: slug,
    });

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: 'Nouvel agent en attente de validation',
        htmlContent: `<p>L'agent <strong>${nomAgence}</strong> (${email}) vient de s'inscrire et attend validation.</p>`,
        type_notif: 'securite'
      });
    }

    res.status(201).json({
      ...construireReponseAuth(user),
      agentProfile,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Inscription d'une candidate (publique)
// @route   POST /api/auth/register-candidate
// @access  Public
const registerCandidate = async (req, res) => {
  let user = null;
  let candidateProfile = null;

  try {
    const { nom, email, password, telephone, ville, age, experienceAnnees, competences, disponibilite, description, agentSlug } = req.body;
    const photo = req.files?.photo?.[0];
    const pieceIdentite = req.files?.pieceIdentite?.[0];

    if (!nom || !email || !password || !ville || !age) {
      supprimerFichiersTeleverses(req.files);
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    if (!pieceIdentite) {
      supprimerFichiersTeleverses(req.files);
      return res.status(400).json({ message: "La pièce d'identité est requise" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      supprimerFichiersTeleverses(req.files);
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    let agent = null;
    if (agentSlug) {
      agent = await AgentProfile.findOne({ urlPersonnalisee: agentSlug, statutValidation: 'valide' });
      if (!agent) {
        supprimerFichiersTeleverses(req.files);
        return res.status(404).json({ message: 'Agent introuvable ou non validé' });
      }
    }

    // --- LOGIQUE SOFT-LOCK (Génération du code et compte à rebours 7 jours) ---
    const codeVerification = Math.floor(1000 + Math.random() * 9000).toString(); // Code à 4 chiffres
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Date actuelle + 7 jours

    user = await User.create({ 
      nom, email, password, telephone, role: 'candidate',
      emailVerifie: false,
      codeVerification,
      expireAt
    });
    // -------------------------------------------------------------------------

    candidateProfile = await CandidateProfile.create({
      user: user._id,
      ville,
      age,
      experienceAnnees: experienceAnnees || 0,
      competences: competences || [],
      disponibilite,
      description,
      agent: agent ? agent._id : null,
      photo: photo ? `/uploads/photos/${photo.filename}` : null,
      pieceIdentite: pieceIdentite.filename,
      pieceIdentiteFournie: true,
    });

    // Envoi de l'e-mail avec le code à la candidate
    const mailCandidateHtml = `
      <h2>Bienvenue ${nom} !</h2>
      <p>Merci pour votre inscription. Afin de valider votre profil et le rendre visible auprès des agences, veuillez saisir ce code de sécurité à 4 chiffres dans votre tableau de bord :</p>
      <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${codeVerification}</h1>
      <p><em>Attention : Sans validation de votre part, ce compte sera automatiquement supprimé dans 7 jours.</em></p>
    `;
    
    await sendEmail({
      to: email,
      subject: 'Votre code de vérification - Aide-Ménagère',
      htmlContent: mailCandidateHtml,
      type_notif: 'general'
    });

    if (agent) {
      try {
        const agentUser = await User.findById(agent.user);
        if (agentUser) {
          await sendEmail({
            to: agentUser.email,
            subject: 'Nouvelle candidate inscrite via votre espace',
            htmlContent: `<p>La candidate <strong>${nom}</strong> vient de s'inscrire via votre lien personnalisé.</p>`,
            type_notif: 'general'
          });
        }
      } catch (erreurNotification) {
        console.error('Notification agent non envoyée :', erreurNotification.message);
      }
    }

    res.status(201).json({
      ...construireReponseAuth(user),
      candidateProfile,
    });
  } catch (error) {
    supprimerFichiersTeleverses(req.files);
    if (candidateProfile) await CandidateProfile.findByIdAndDelete(candidateProfile._id).catch(() => {});
    if (user) await User.findByIdAndDelete(user._id).catch(() => {});

    res.status(400).json({ message: error.message });
  }
};

// @desc    Connexion (tous rôles confondus)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (!user.actif) {
      return res.status(403).json({ message: "Compte désactivé, contactez l'administrateur" });
    }

    res.json(construireReponseAuth(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Privé
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Générer un lien de réinitialisation et l'envoyer par mail
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: "Aucun compte n'est associé à cet e-mail" });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');

      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const resetUrl = `http://localhost:4200/reinitialiser-mot-de-passe/${resetToken}`;

      const message = `
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe sur la Plateforme Aide-Ménagère.</p>
          <p>Cliquez sur ce lien pour choisir un nouveau mot de passe :</p>
          <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">Réinitialiser mon mot de passe</a>
          <p>Ce lien expirera dans 15 minutes.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
      `;

      try {
          await sendEmail({
              to: user.email,
              subject: 'Réinitialisation de votre mot de passe',
              htmlContent: message,
              type_notif: 'securite'
          });

          res.status(200).json({ message: "Un e-mail de réinitialisation vous a été envoyé" });
      } catch (error) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          await user.save({ validateBeforeSave: false });

          return res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail de réinitialisation" });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
      const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

      const user = await User.findOne({
          resetPasswordToken,
          resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
          return res.status(400).json({ message: "Le lien est invalide ou a expiré" });
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier l'email de la candidate avec le code à 4 chiffres
// @route   POST /api/auth/verify-email
// @access  Privé
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.emailVerifie) return res.status(400).json({ message: 'Votre compte est déjà vérifié.' });
    if (user.codeVerification !== code) return res.status(400).json({ message: 'Code incorrect.' });

    // Le code est bon : on valide le compte et on efface la date d'autodestruction
    user.emailVerifie = true;
    user.codeVerification = undefined;
    user.expireAt = undefined; // Sauve le compte de la suppression de MongoDB
    await user.save();

    res.json({ message: 'Email vérifié avec succès. Votre profil est désormais public !' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAgent, registerCandidate, login, getMe, forgotPassword, resetPassword, verifyEmail };