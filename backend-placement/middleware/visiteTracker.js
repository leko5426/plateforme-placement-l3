const Visite = require('../models/Visite');

// Enregistre chaque visite en base pour alimenter les statistiques admin
// categorie : ex 'accueil', 'agent', 'candidate', 'annonce'
const trackerVisite = (categorie = 'autre') => {
  return async (req, res, next) => {
    // On ne bloque jamais la requête pour ça : exécution en arrière-plan
    Visite.create({
      route: req.originalUrl,
      categorie,
      utilisateur: req.user ? req.user._id : null,
    }).catch((err) => console.error('Erreur tracking visite:', err.message));

    next();
  };
};

module.exports = trackerVisite;
