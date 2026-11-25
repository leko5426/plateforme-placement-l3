const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Map userId -> socketId pour savoir qui est connecté
const utilisateursConnectes = new Map();

// Retourne la conversation si l'utilisateur en est participant, sinon null
const conversationSiParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return null;

  const estParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
  return estParticipant ? conversation : null;
};

const initSocket = (io) => {
  // Authentification du socket via le token JWT (envoyé dans le handshake)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token manquant'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Utilisateur introuvable'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentification socket échouée'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    utilisateursConnectes.set(userId, socket.id);
    console.log(`🔌 Utilisateur connecté au chat : ${userId}`);

    // Rejoindre une conversation : uniquement si on en est participant
    socket.on('rejoindre_conversation', async (conversationId) => {
      try {
        const conversation = await conversationSiParticipant(conversationId, userId);
        if (conversation) socket.join(conversationId);
      } catch (error) {
        // identifiant invalide : on ignore
      }
    });

    // Envoyer un message : uniquement dans une conversation dont on fait partie
    socket.on('envoyer_message', async ({ conversationId, contenu }) => {
      try {
        const texte = typeof contenu === 'string' ? contenu.trim() : '';
        if (!texte) return;

        const conversation = await conversationSiParticipant(conversationId, userId);
        if (!conversation) {
          return socket.emit('erreur_message', { message: 'Accès refusé à cette conversation' });
        }

        const message = await Message.create({
          conversation: conversationId,
          expediteur: socket.user._id,
          contenu: texte,
        });

        conversation.dernierMessage = texte;
        conversation.dateMaj = new Date();
        await conversation.save();

        const messagePopule = await message.populate('expediteur', 'nom email role');

        // Diffuse à tous les membres de la conversation (room)
        io.to(conversationId).emit('nouveau_message', messagePopule);
      } catch (error) {
        socket.emit('erreur_message', { message: error.message });
      }
    });

    // Indicateur "en train d'écrire" : seulement si on a rejoint la room
    socket.on('en_train_decrire', ({ conversationId }) => {
      if (!socket.rooms.has(conversationId)) return;
      socket.to(conversationId).emit('en_train_decrire', { userId });
    });

    socket.on('disconnect', () => {
      utilisateursConnectes.delete(userId);
      console.log(`🔌 Utilisateur déconnecté du chat : ${userId}`);
    });
  });
};

module.exports = { initSocket, utilisateursConnectes };