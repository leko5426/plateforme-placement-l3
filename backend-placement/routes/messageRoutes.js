const express = require('express');
const router = express.Router();
const {
  demarrerConversation,
  listerConversations,
  obtenirMessages,
  envoyerMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, demarrerConversation);
router.get('/', protect, listerConversations);
router.get('/:id/messages', protect, obtenirMessages);
router.post('/:id/messages', protect, envoyerMessage);

module.exports = router;