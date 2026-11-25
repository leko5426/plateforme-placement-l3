const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dossierUploads = path.join(__dirname, '..', 'uploads', 'photos');
if (!fs.existsSync(dossierUploads)) {
  fs.mkdirSync(dossierUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dossierUploads);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, nomUnique);
  },
});

const filtreFichiers = (req, file, cb) => {
  // Autoriser les images pour la photo ET les PDF (ou images) pour la pièce d'identité
  const typesAutorises = /jpeg|jpg|png|webp|pdf/;
  const extensionValide = typesAutorises.test(path.extname(file.originalname).toLowerCase());
  
  // Pour le mimetype du PDF, il faut accepter application/pdf en plus des images
  const mimeValide = /jpeg|jpg|png|webp|pdf/.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extensionValide && mimeValide) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (jpeg, jpg, png, webp) et les documents PDF sont autorisés'));
  }
};

const upload = multer({
  storage,
  fileFilter: filtreFichiers,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

module.exports = upload;