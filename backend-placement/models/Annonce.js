const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema(
  {
    employeur: {
      nom: { type: String, required: true, trim: true },
      entreprise: { type: String, trim: true, default: '' },
      email: { type: String, required: true, trim: true, lowercase: true },
      telephone: { type: String, trim: true },
    },
    employeurUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    titre: {
      type: String,
      required: [true, "Le titre de l'annonce est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    localisation: {
      type: String,
      required: true,
      trim: true,
    },
    criteres: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 70 },
      experienceMin: { type: Number, default: 0 },
    },
    // NOUVEAU CHAMP : La candidate spécifiquement demandée par le client
    candidateCible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      default: null,
    },
    agentDestinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentProfile',
      default: null,
    },
    statut: {
      type: String,
      enum: ['nouvelle', 'en_traitement', 'cloturee'],
      default: 'nouvelle',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Annonce', annonceSchema);