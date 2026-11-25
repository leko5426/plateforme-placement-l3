const express = require('express');
const router = express.Router();
const {
  listerAgentsAdmin,
  listerUtilisateurs,
  validerAgent,
  changerStatutUtilisateur,
  obtenirStatistiques,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect, authorize('admin'));

router.get('/agents', listerAgentsAdmin);
router.get('/users', listerUtilisateurs);
router.patch('/agents/:id/validation', validerAgent);
router.patch('/users/:id/statut', changerStatutUtilisateur);
router.get('/stats', obtenirStatistiques);

module.exports = router;
