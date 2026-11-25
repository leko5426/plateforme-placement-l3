const AgentProfile = require('../models/AgentProfile');
const CandidateProfile = require('../models/CandidateProfile');
const Annonce = require('../models/Annonce');
const Visite = require('../models/Visite');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Lister les agents en attente de validation (+ tous si besoin)
// @route   GET /api/admin/agents
// @access  Privé (admin)
const listerAgentsAdmin = async (req, res) => {
  try {
    const filtre = {};
    if (req.query.statutValidation) filtre.statutValidation = req.query.statutValidation;

    const agents = await AgentProfile.find(filtre)
      .populate('user', 'nom email telephone actif')
      .sort({ createdAt: -1 });

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Valider ou rejeter un compte agent
// @route   PATCH /api/admin/agents/:id/validation
// @access  Privé (admin)
const validerAgent = async (req, res) => {
  try {
    const { statutValidation } = req.body;
    if (!['valide', 'rejete'].includes(statutValidation)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const agent = await AgentProfile.findById(req.params.id).populate('user', 'nom email');
    if (!agent) return res.status(404).json({ message: 'Agent introuvable' });

    agent.statutValidation = statutValidation;
    await agent.save();

    const statutLisible = statutValidation === 'valide' ? 'validé' : 'rejeté';
    await sendEmail({
      to: agent.user.email,
      subject: `Votre compte agent a été ${statutLisible}`,
      html: `<p>Bonjour ${agent.user.nom},</p><p>Votre compte agent a été <strong>${statutLisible}</strong> par l'administration.</p>`,
    });

    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Lister tous les utilisateurs (filtrable par rôle)
// @route   GET /api/admin/users
// @access  Privé (admin)
const listerUtilisateurs = async (req, res) => {
  try {
    const filtre = {};
    if (req.query.role) filtre.role = req.query.role;

    const users = await User.find(filtre).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activer / désactiver un utilisateur (agent, candidate...)
// @route   PATCH /api/admin/users/:id/statut
// @access  Privé (admin)
const changerStatutUtilisateur = async (req, res) => {
  try {
    const { actif } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { actif }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const Notification = require('../models/Notification');

// Consultation du journal des notifications et e-mails par l'administrateur
exports.getEmailLogs = async (req, res) => {
    try {
        const { statut, type } = req.query;
        let query = {};

        if (statut) query.statut = statut;
        if (type) query.type_notif = type;

        const logs = await Notification.find(query)
            .sort({ dat_envoi_notif: -1 })
            .limit(100); // Les 100 dernières notifications

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la récupération du journal", error: error.message });
    }
};

// @desc    Statistiques générales de la plateforme
// @route   GET /api/admin/stats
// @access  Privé (admin)
const obtenirStatistiques = async (req, res) => {
  try {
    const [
      nombreAgents,
      nombreAgentsEnAttente,
      nombreCandidates,
      candidatesParStatut,
      nombreAnnonces,
      visitesParCategorie,
      totalVisites,
    ] = await Promise.all([
      AgentProfile.countDocuments({ statutValidation: 'valide' }),
      AgentProfile.countDocuments({ statutValidation: 'en_attente' }),
      CandidateProfile.countDocuments(),
      CandidateProfile.aggregate([{ $group: { _id: '$statut', total: { $sum: 1 } } }]),
      Annonce.countDocuments(),
      Visite.aggregate([{ $group: { _id: '$categorie', total: { $sum: 1 } } }]),
      Visite.countDocuments(),
    ]);

    res.json({
      nombreAgents,
      nombreAgentsEnAttente,
      nombreCandidates,
      candidatesParStatut,
      nombreAnnonces,
      visitesParCategorie,
      totalVisites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listerAgentsAdmin,
  listerUtilisateurs,
  validerAgent,
  changerStatutUtilisateur,
  obtenirStatistiques,
};
