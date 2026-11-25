// Script à exécuter une seule fois pour créer le compte admin initial.
// Usage : node seed/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const User = require('../models/User');

// Même correctif que dans config/db.js : nécessaire sur certains réseaux
// (hotspot mobile notamment) où le résolveur DNS interne de Node.js échoue
// sur les requêtes SRV.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const creerAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB Atlas');

    const emailAdmin = process.env.ADMIN_EMAIL || 'honoreakabla@gmail.com';
    const existant = await User.findOne({ email: emailAdmin });

    if (existant) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà.');
      process.exit(0);
    }

    const motDePasseAdmin = 'ChangeMoi123!'; // ⚠️ à changer immédiatement après la première connexion

    const admin = await User.create({
      nom: 'Administrateur',
      email: emailAdmin,
      password: motDePasseAdmin,
      role: 'admin',
    });

    console.log('✅ Compte admin créé avec succès :');
    console.log(`   Email : ${admin.email}`);
    console.log(`   Mot de passe temporaire : ${motDePasseAdmin}`);
    console.log('   ⚠️  Pense à le changer rapidement.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
  }
};

creerAdmin();