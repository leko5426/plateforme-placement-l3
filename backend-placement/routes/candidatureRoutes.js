const express = require('express');
const router = express.Router();
const candidatureController = require('../controllers/candidatureController');
const { protect, protectOptionnel } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../middleware/upload');

// FONCTION ANTI-CRASH
const safe = (method) => (req, res, next) => {
    if (candidatureController[method]) return candidatureController[method](req, res, next);
    res.status(500).json({ success: false, message: `Erreur interne : Fonction ${method} introuvable.` });
};

// ==========================================
// ROUTES SPÉCIFIQUES
// ==========================================
router.get('/independantes', protect, authorize('agent', 'admin'), safe('listerCandidaturesSpontanees'));
router.put('/:id/integrer', protect, authorize('agent', 'admin'), safe('integrerCandidate'));

router.get('/public', protectOptionnel, safe('getPublicCandidates'));
router.get('/me', protect, authorize('candidate'), safe('obtenirMonProfilCandidate'));
router.put('/me', protect, authorize('candidate'), upload.single('photo'), safe('modifierMonProfilCandidate'));

// ==========================================
// ROUTES GÉNÉRALES
// ==========================================
router.get('/', protect, authorize('agent', 'admin'), safe('listerCandidatures'));
router.post('/', protect, authorize('candidate'), upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'pieceIdentite', maxCount: 1 }]), safe('creerCandidature'));

// ==========================================
// ROUTES AVEC ID (Doivent rester EN BAS)
// ==========================================
router.get('/:id/piece-identite', protect, authorize('agent', 'admin', 'candidate'), safe('obtenirPieceIdentite'));
router.patch('/:id/piece-identite', protect, authorize('agent', 'admin', 'candidate'), upload.single('pieceIdentite'), safe('ajouterPieceIdentite'));

router.get('/:id', protectOptionnel, safe('obtenirCandidate'));
router.patch('/:id/statut', protect, authorize('agent', 'admin'), safe('changerStatutCandidature'));

module.exports = router;