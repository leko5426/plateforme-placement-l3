const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema(
  {
    signalePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    emailSignaleur: {
      type: String,
      trim: true,
      default: '',
    },
    cibleType: {
      type: String,
      enum: ['agent', 'candidate', 'annonce'],
      required: true,
    },
    cibleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    motif: {
      type: String,
      required: [true, 'Le motif du signalement est requis'],
      trim: true,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'traite', 'rejete'],
      default: 'en_attente',
    },
    commentaireAdmin: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Signalement', signalementSchema);
