const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Démarrer ou récupérer une conversation existante avec un autre utilisateur
// @route   POST /api/conversations
// @access  Privé
const demarrerConversation = async (req, res) => {
  try {
    const { destinataireId } = req.body;

    const destinataire = await User.findById(destinataireId);
    if (!destinataire) return res.status(404).json({ message: 'Destinataire introuvable' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, destinataireId], $size: 2 },
    }).populate('participants', 'nom email role');

    if (!conversation) {
      const creee = await Conversation.create({
        participants: [req.user._id, destinataireId],
      });
      conversation = await Conversation.findById(creee._id).populate(
        'participants',
        'nom email role'
      );
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Lister les conversations de l'utilisateur connecté
// @route   GET /api/conversations
// @access  Privé
const listerConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'nom email role')
      .sort({ dateMaj: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer l'historique des messages d'une conversation
// @route   GET /api/conversations/:id/messages
// @access  Privé (participant uniquement)
const obtenirMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation introuvable' });

    const estParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!estParticipant) return res.status(403).json({ message: 'Accès refusé' });

    const messages = await Message.find({ conversation: req.params.id })
      .populate('expediteur', 'nom email role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Envoyer un message dans une conversation
// @route   POST /api/conversations/:id/messages
// @access  Privé (participant uniquement)
const envoyerMessage = async (req, res) => {
  try {
    const { contenu } = req.body;
    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation introuvable' });

    const estParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!estParticipant) return res.status(403).json({ message: 'Accès refusé' });

    let message = await Message.create({
      conversation: conversation._id,
      expediteur: req.user._id,
      contenu: contenu.trim(),
    });

    message = await message.populate('expediteur', 'nom email role');

    conversation.dateMaj = new Date();
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  demarrerConversation,
  listerConversations,
  obtenirMessages,
  envoyerMessage,
};