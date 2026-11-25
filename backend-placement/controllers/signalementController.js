const Signalement = require('../models/Signalement');

// @desc    Créer un signalement (avec ou sans compte)
// @route   POST /api/signalements
// @access  Public
const creerSignalement = async (req, res) => {
  try {
    const { cibleType, cibleId, motif, emailSignaleur } = req.body;

    if (!cibleType || !cibleId || !motif) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const signalement = await Signalement.create({
      signalePar: req.user ? req.user._id : null,
      emailSignaleur: req.user ? '' : emailSignaleur,
      cibleType,
      cibleId,
      motif,
    });

    res.status(201).json(signalement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Lister les signalements
// @route   GET /api/signalements
// @access  Privé (admin)
const listerSignalements = async (req, res) => {
  try {
    const filtre = {};
    if (req.query.statut) filtre.statut = req.query.statut;

    const signalements = await Signalement.find(filtre)
      .populate('signalePar', 'nom email')
      .sort({ createdAt: -1 });

    res.json(signalements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Traiter un signalement
// @route   PATCH /api/signalements/:id
// @access  Privé (admin)
const traiterSignalement = async (req, res) => {
  try {
    const { statut, commentaireAdmin } = req.body;
    if (!['traite', 'rejete'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const signalement = await Signalement.findByIdAndUpdate(
      req.params.id,
      { statut, commentaireAdmin },
      { new: true }
    );
    if (!signalement) return res.status(404).json({ message: 'Signalement introuvable' });

    res.json(signalement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { creerSignalement, listerSignalements, traiterSignalement };
