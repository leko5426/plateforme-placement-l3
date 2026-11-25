const AgentProfile = require('../models/AgentProfile');
const CandidateProfile = require('../models/CandidateProfile');
const Candidature = require('../models/Candidature');

// @desc    Liste publique des agents validés (avec filtre localisation optionnel)
// @route   GET /api/agents
// @access  Public
const listerAgents = async (req, res) => {
  try {
    const filtre = { statutValidation: 'valide' };
    if (req.query.localisation) {
      filtre.localisation = { $regex: req.query.localisation, $options: 'i' };
    }

    const agents = await AgentProfile.find(filtre)
      .populate('user', 'nom email telephone')
      .sort({ createdAt: -1 });

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir la fiche publique d'un agent via son URL personnalisée
// @route   GET /api/agents/:slug
// @access  Public
const obtenirAgentParSlug = async (req, res) => {
  try {
    const agent = await AgentProfile.findOne({
      urlPersonnalisee: req.params.slug,
      statutValidation: 'valide',
    }).populate('user', 'nom email telephone');

    if (!agent) return res.status(404).json({ message: 'Agent introuvable' });

    // Incrémente le compteur de vues de la fiche agent
    agent.vues += 1;
    await agent.save();

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir/modifier son propre profil agent
// @route   GET /api/agents/me/profil
// @access  Privé (agent)
const obtenirMonProfil = async (req, res) => {
  try {
    const agent = await AgentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'nom email telephone'
    );
    if (!agent) return res.status(404).json({ message: 'Profil agent introuvable' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Modifier son propre profil (nom agence, localisation, description, logo)
// @route   PUT /api/agents/me/profil
// @access  Privé (agent)
const modifierMonProfil = async (req, res) => {
  try {
    const agent = await AgentProfile.findOne({ user: req.user._id });
    if (!agent) return res.status(404).json({ message: 'Profil agent introuvable' });

    const { nomAgence, localisation, description } = req.body;
    if (nomAgence) agent.nomAgence = nomAgence;
    if (localisation) agent.localisation = localisation;
    if (description !== undefined) agent.description = description;
    if (req.file) agent.logo = `/uploads/photos/${req.file.filename}`;

    await agent.save();
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Tableau de bord agent : statistiques
// @route   GET /api/agents/me/dashboard
// @access  Privé (agent)
const obtenirDashboard = async (req, res) => {
  try {
    const agent = await AgentProfile.findOne({ user: req.user._id });
    if (!agent) return res.status(404).json({ message: 'Profil agent introuvable' });

    const filtreAgent = { $in: [agent._id, req.user._id] };

    const nombreCandidates = await CandidateProfile.countDocuments({ agent: filtreAgent });
    const candidatesParStatut = await CandidateProfile.aggregate([
      { $match: { agent: { $in: [agent._id, req.user._id] } } },
      { $group: { _id: '$statut', total: { $sum: 1 } } },
    ]);
    const nombreCandidaturesEnAttente = await Candidature.countDocuments({
      agent: filtreAgent,
      statut: 'en_attente',
    });

    res.set('Cache-Control', 'no-store');
    res.json({
      nombreCandidates,
      vuesFiche: agent.vues,
      candidatesParStatut,
      nombreCandidaturesEnAttente,
      statutValidation: agent.statutValidation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Liste des candidates rattachées à l'agent connecté
// @route   GET /api/agents/me/candidates
// @access  Privé (agent)
const listerMesCandidates = async (req, res) => {
  try {
    const agent = await AgentProfile.findOne({ user: req.user._id });
    if (!agent) return res.status(404).json({ message: 'Profil agent introuvable' });

    // --- DIAGNOSTIC DANS LE TERMINAL ---
    const derniereCandidate = await CandidateProfile.findOne().sort({ updatedAt: -1 }).populate('user', 'nom');
    console.log("==========================================");
    console.log("🔍 ID AgentProfile (agent._id) :", agent._id.toString());
    console.log("🔍 ID User (req.user._id)      :", req.user._id.toString());
    console.log("🔍 Dernière candidate en base  :", {
      id: derniereCandidate?._id?.toString(),
      nom: derniereCandidate?.user?.nom,
      agentEnregistre: derniereCandidate?.agent ? derniereCandidate.agent.toString() : null,
      statutEnregistre: derniereCandidate?.statut
    });
    console.log("==========================================");

    // Récupère les candidates liées soit à l'ID du profil agence, soit à l'ID user de l'agent
    const filtre = { agent: { $in: [agent._id, req.user._id] } };
    if (req.query.statut) filtre.statut = req.query.statut;

    const candidates = await CandidateProfile.find(filtre)
      .populate('user', 'nom email telephone')
      .sort({ createdAt: -1 });

    res.set('Cache-Control', 'no-store');
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ajouter manuellement une candidate à son portefeuille (agent gère lui-même la fiche)
// @route   POST /api/agents/me/candidates
// @access  Privé (agent)
const ajouterCandidate = async (req, res) => {
  try {
    const agent = await AgentProfile.findOne({ user: req.user._id });
    if (!agent) return res.status(404).json({ message: 'Profil agent introuvable' });

    const User = require('../models/User');
    const { nom, email, password, telephone, ville, age, experienceAnnees, competences, disponibilite, description } =
      req.body;

    if (!nom || !email || !password || !ville || !age) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const user = await User.create({ nom, email, password, telephone, role: 'candidate' });

    const candidateProfile = await CandidateProfile.create({
      user: user._id,
      ville,
      age,
      experienceAnnees: experienceAnnees || 0,
      competences: competences || [],
      disponibilite,
      description,
      agent: agent._id,
      photo: req.file ? `/uploads/photos/${req.file.filename}` : null,
    });

    res.status(201).json(candidateProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  listerAgents,
  obtenirAgentParSlug,
  obtenirMonProfil,
  modifierMonProfil,
  obtenirDashboard,
  listerMesCandidates,
  ajouterCandidate,
};