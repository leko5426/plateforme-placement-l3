const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    photo: {
      type: String,
      default: null,
    },
    pieceIdentite: {
      type: String,
      default: null,
      select: false,
    },
    pieceIdentiteFournie: {
      type: Boolean,
      default: false,
    },
    ville: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "L'âge est requis"],
      min: 18,
      max: 70,
    },
    experienceAnnees: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    competences: {
      type: [String],
      default: [],
    },
    disponibilite: {
      type: String,
      enum: ['temps_plein', 'temps_partiel', 'ponctuel', 'disponible'],
      default: 'temps_plein',
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentProfile',
      default: null,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'disponible', 'verifiee', 'en_mission', 'archivee', 'placee', 'radiee'],
      default: 'en_attente',
    },
    profilVerifie: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.pieceIdentite;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.pieceIdentite;
        return ret;
      },
    }
  }
);

candidateProfileSchema.index({ ville: 1, age: 1, experienceAnnees: 1, statut: 1 });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);