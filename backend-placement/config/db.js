const mongoose = require('mongoose');
const dns = require('dns');

// Sur certains réseaux (notamment le partage de connexion mobile / hotspot),
// le résolveur DNS interne de Node.js (c-ares) échoue à récupérer les
// enregistrements SRV nécessaires à "mongodb+srv://", même quand la
// résolution fonctionne très bien au niveau du système d'exploitation
// (ex: via `nslookup`). On force donc Node à interroger un DNS public
// fiable avant toute tentative de connexion.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Atlas connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion à MongoDB Atlas : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;