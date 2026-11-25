const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const CandidateProfile = require('../models/CandidateProfile');
const AgentProfile = require('../models/AgentProfile');

const dossierIdentites = path.join(__dirname, '..', 'private_uploads', 'identites');

// @desc    Consulter la pièce d'identité d'une candidate
// @route   GET /api/candidates/:id/piece-identite
// @access  Privé : admin, ou agent validé auquel la candidate est rattachée
const obtenirPieceIdentite = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Candidate introuvable' });
    }

    // "+pieceIdentite" : le champ est exclu par défaut du schéma
    const candidate = await CandidateProfile.findById(req.params.id).select('+pieceIdentite');
    if (!candidate) return res.status(404).json({ message: 'Candidate introuvable' });

    if (req.user.role === 'agent') {
      const agent = await AgentProfile.findOne({ user: req.user._id });
      const autorise =
        agent &&
        agent.statutValidation === 'valide' &&
        candidate.agent &&
        candidate.agent.toString() === agent._id.toString();

      if (!autorise) {
        return res.status(403).json({ message: "Tu n'as pas accès à ce document" });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Tu n'as pas accès à ce document" });
    }

    if (!candidate.pieceIdentite) {
      return res.status(404).json({ message: "Aucune pièce d'identité enregistrée" });
    }

    // path.basename : protège contre toute valeur du type "../../fichier"
    const chemin = path.join(dossierIdentites, path.basename(candidate.pieceIdentite));
    if (!fs.existsSync(chemin)) {
      return res.status(404).json({ message: 'Fichier introuvable sur le serveur' });
    }

    console.log(`🪪 Pièce d'identité ${candidate._id} consultée par ${req.user._id} (${req.user.role})`);

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(chemin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { obtenirPieceIdentite };