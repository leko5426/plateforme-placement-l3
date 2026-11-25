const rateLimit = require('express-rate-limit');

// Limiteur spécifique pour la connexion (Login)
const loginLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // Fenêtre de temps : 20 minutes
  max: 5, // Bloque après 5 tentatives depuis la même IP
  message: {
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 20 minutes.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// NOUVEAU : Limiteur pour l'inscription publique (bloque les robots)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Fenêtre de 1 heure
  max: 3, // Maximum 3 créations de comptes publics par heure par IP
  message: { 
    message: 'Trop de comptes créés récemment. Veuillez réessayer plus tard.' 
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = { loginLimiter, registerLimiter };