const mongoose = require('mongoose');

const agentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    nomAgence: {
      type: String,
      required: [true, "Le nom de l'agence/agent est requis"],
      trim: true,
    },
    logo: {
      type: String, // chemin vers le fichier uploadé
      default: null,
    },
    localisation: {
      type: String,
      required: [true, 'La localisation est requise'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    urlPersonnalisee: {
      type: String, // ex: "mamadou" -> plateforme.ci/agent/mamadou
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    statutValidation: {
      type: String,
      enum: ['en_attente', 'valide', 'rejete'],
      default: 'en_attente',
    },
    vues: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AgentProfile', agentProfileSchema);
