const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dossierPhotos = path.join(__dirname, '..', 'uploads', 'photos');
// Volontairement HORS du dossier "uploads", que server.js publie en accès libre
const dossierIdentites = path.join(__dirname, '..', 'private_uploads', 'identites');

[dossierPhotos, dossierIdentites].forEach((dossier) => fs.mkdirSync(dossier, { recursive: true }));

const EXTENSIONS_PHOTO = ['.jpg', '.jpeg', '.png', '.webp'];
const MIMES_PHOTO = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'pieceIdentite' ? dossierIdentites : dossierPhotos);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString('hex')}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const estIdentite = file.fieldname === 'pieceIdentite';
  const extensions = estIdentite ? [...EXTENSIONS_PHOTO, '.pdf'] : EXTENSIONS_PHOTO;
  const mimes = estIdentite ? [...MIMES_PHOTO, 'application/pdf'] : MIMES_PHOTO;

  const extension = path.extname(file.originalname).toLowerCase();
  if (extensions.includes(extension) && mimes.includes(file.mimetype)) {
    return cb(null, true);
  }

  const erreur = new Error(
    estIdentite
      ? "Pièce d'identité : formats acceptés JPG, PNG, WEBP ou PDF"
      : 'Photo : formats acceptés JPG, PNG ou WEBP'
  );
  erreur.status = 400;
  cb(erreur);
};

const envoyer = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 }, // 5 Mo max par fichier
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'pieceIdentite', maxCount: 1 },
]);

// Enveloppe pour renvoyer des erreurs 400 lisibles au lieu d'une erreur 500
const uploadInscription = (req, res, next) => {
  envoyer(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Fichier trop volumineux (5 Mo maximum)'
          : 'Fichier non accepté';
      return res.status(400).json({ message });
    }
    return res.status(err.status || 400).json({ message: err.message });
  });
};

module.exports = uploadInscription;