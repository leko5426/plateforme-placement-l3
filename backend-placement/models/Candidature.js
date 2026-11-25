const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema(
  {
    // L'employeur qui fait la demande de recrutement
    employeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // La candidate ciblée
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: true,
    },
    // Postule auprès d'un agent, et/ou en réponse à une annonce précise
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentProfile',
      default: null,
    },
    annonce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Annonce',
      default: null,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    statut: {
      type: String,
      enum: ['en_attente', 'acceptee', 'refusee'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidature', candidatureSchema);