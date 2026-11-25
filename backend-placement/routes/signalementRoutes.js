const express = require('express');
const router = express.Router();
const {
  creerSignalement,
  listerSignalements,
  traiterSignalement,
} = require('../controllers/signalementController');
const { protect, protectOptionnel } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/', protectOptionnel, creerSignalement);
router.get('/', protect, authorize('admin'), listerSignalements);
router.patch('/:id', protect, authorize('admin'), traiterSignalement);

module.exports = router;
