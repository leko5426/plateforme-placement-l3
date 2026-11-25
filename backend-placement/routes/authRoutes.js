const express = require('express');
const router = express.Router();
const { registerAgent, registerCandidate, login, getMe, forgotPassword, resetPassword, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Import des limiteurs de requêtes
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

router.post('/register-agent', registerAgent);

// Application du limiteur sur l'inscription publique + gestion des fichiers
router.post(
    '/register-candidate', 
    registerLimiter, // Limiteur (3 max par heure)
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'pieceIdentite', maxCount: 1 }
    ]), 
    registerCandidate
);

// Application du limiteur sur la route de connexion (5 max par 20 min)
router.post('/login', loginLimiter, login);

router.get('/me', protect, getMe);

// Nouvelle route pour valider le code à 4 chiffres de la candidate
router.post('/verify-email', protect, verifyEmail);

// Routes pour le mot de passe oublié
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;