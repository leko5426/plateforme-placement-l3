const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});
initSocket(io);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Sert les photos/logos uploadés statiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/annonces', require('./routes/annonceRoutes'));
app.use('/api/candidatures', require('./routes/candidatureRoutes'));
app.use('/api/conversations', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/signalements', require('./routes/signalementRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'API Plateforme de placement d\'aide-ménagères - opérationnelle 🚀' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});