const express = require('express');
const router = express.Router();
const { 
  creerAnnonce, 
  listerAnnonces, 
  obtenirAnnonce, 
  modifierAnnonce, 
  supprimerAnnonce,
  getMesAnnonces 
} = require('../controllers/annonceController');

const { protect } = require('../middleware/auth'); 

// Route publique pour créer une demande (et recevoir le lien magique)
router.post('/', creerAnnonce);

// Route privée (Lien Magique) pour que l'employeur consulte son historique
// DOIT IMPÉRATIVEMENT être avant router.get('/:id')
router.get('/mes-annonces', protect, getMesAnnonces);

// Routes privées pour les agents et l'admin
router.get('/', protect, listerAnnonces);
router.get('/:id', protect, obtenirAnnonce);

// --- AJOUT ICI : Support de PUT et de PATCH pour la prise en charge ---
router.put('/:id', protect, modifierAnnonce);
router.patch('/:id', protect, modifierAnnonce);
// ----------------------------------------------------------------------

router.delete('/:id', protect, supprimerAnnonce);

module.exports = router;