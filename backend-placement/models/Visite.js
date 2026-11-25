const mongoose = require('mongoose');

const visiteSchema = new mongoose.Schema(
  {
    route: {
      type: String,
      required: true,
    },
    categorie: {
      type: String, // ex: 'agent', 'candidate', 'annonce', 'accueil'
      default: 'autre',
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: { createdAt: 'dateVisite', updatedAt: false } }
);

module.exports = mongoose.model('Visite', visiteSchema);
