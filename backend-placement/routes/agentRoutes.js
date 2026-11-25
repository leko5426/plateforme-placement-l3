const express = require('express');
const router = express.Router();
const {
  listerAgents,
  obtenirAgentParSlug,
  obtenirMonProfil,
  modifierMonProfil,
  obtenirDashboard,
  listerMesCandidates,
  ajouterCandidate,
} = require('../controllers/agentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../middleware/upload');
const trackerVisite = require('../middleware/visiteTracker');

// Routes publiques
router.get('/', trackerVisite('agent'), listerAgents);

// Routes privées agent (déclarées avant "/:slug" pour éviter les conflits de route)
router.get('/me/profil', protect, authorize('agent'), obtenirMonProfil);
router.put('/me/profil', protect, authorize('agent'), upload.single('logo'), modifierMonProfil);
router.get('/me/dashboard', protect, authorize('agent'), obtenirDashboard);
router.get('/me/candidates', protect, authorize('agent'), listerMesCandidates);
router.post(
  '/me/candidates',
  protect,
  authorize('agent'),
  upload.single('photo'),
  ajouterCandidate
);

// Fiche publique d'un agent via son URL personnalisée (doit rester après les routes /me/*)
router.get('/:slug', trackerVisite('agent'), obtenirAgentParSlug);

module.exports = router;
