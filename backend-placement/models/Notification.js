const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type_notif: { 
        type: String, 
        required: true, 
        enum: ['confirmation_demande', 'offre_candidate', 'debut_placement', 'fin_placement', 'signalement', 'general'] 
    },
    destinataire: { type: String, required: true },
    sujet: { type: String, required: true },
    message_notif: { type: String, required: true },
    statut: { type: String, enum: ['succes', 'echec'], default: 'succes' },
    dat_envoi_notif: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);