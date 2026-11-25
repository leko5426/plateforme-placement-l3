const express = require('express');
const router = express.Router();

const { protect, protectOptionnel } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../middleware/upload');
const candidatureController = require('../controllers/candidatureController');

// FONCTION ANTI-CRASH : Protège le démarrage du serveur
const safe = (method) => (req, res, next) => {
    if (candidatureController[method]) return candidatureController[method](req, res, next);
    res.status(500).json({ success: false, message: `Erreur interne : Fonction ${method} introuvable.` });
};

// ==========================================
// 1. NOUVELLES ROUTES (Logique intégrée directement)
// ==========================================
router.get('/independantes', protect, authorize('agent', 'admin'), async (req, res) => {
    try {
        const CandidateProfile = require('../models/CandidateProfile');
        const User = require('../models/User');

        const candidatesSansAgence = await CandidateProfile.find({
            $or: [{ agent: { $exists: false } }, { agent: null }]
        }).lean().sort({ createdAt: -1 });

        const userIds = candidatesSansAgence.map(c => c.user).filter(Boolean);
        const users = await User.find({ _id: { $in: userIds } }).select('nom email telephone').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const data = candidatesSansAgence.map(c => ({
            ...c,
            user: c.user ? userMap.get(c.user.toString()) || null : null
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/integrer', protect, authorize('agent', 'admin'), async (req, res) => {
    try {
        const CandidateProfile = require('../models/CandidateProfile');
        const agentId = req.user.profileId || req.user._id; 
        
        const candidate = await CandidateProfile.findById(req.params.id);
        if (!candidate) return res.status(404).json({ success: false, message: "Candidate introuvable" });

        candidate.agent = agentId;
        candidate.statut = 'verifiee';
        await candidate.save();

        res.status(200).json({ success: true, message: "Candidate intégrée avec succès !", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. ROUTES ADMIN (Signalements)
// ==========================================
router.get('/admin/signalements', protect, authorize('admin'), safe('listerSignalementsAdmin'));

// ==========================================
// 3. TES AUTRES ROUTES (Sécurisées par l'anti-crash)
// ==========================================
router.get('/public', protectOptionnel, safe('getPublicCandidates'));
router.get('/me', protect, authorize('candidate'), safe('obtenirMonProfilCandidate'));
router.put('/me', protect, authorize('candidate'), upload.single('photo'), safe('modifierMonProfilCandidate'));

router.get('/', protect, authorize('agent', 'admin'), safe('listerCandidatures'));
router.post('/', protect, authorize('candidate'), upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'pieceIdentite', maxCount: 1 }]), safe('creerCandidature'));

router.get('/:id/piece-identite', protect, authorize('agent', 'admin', 'candidate'), safe('obtenirPieceIdentite'));
router.patch('/:id/piece-identite', protect, authorize('agent', 'admin', 'candidate'), upload.single('pieceIdentite'), safe('ajouterPieceIdentite'));

// Route de signalement (publique ou connectée)
router.post('/:id/signaler', protectOptionnel, safe('signalerCandidate'));

router.get('/:id', protectOptionnel, safe('obtenirCandidate'));
router.patch('/:id/statut', protect, authorize('agent', 'admin'), safe('changerStatutCandidature'));

module.exports = router;