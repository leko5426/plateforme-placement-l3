const PDFDocument = require('pdfkit');

// Génère un PDF du profil candidate et l'envoie directement dans la réponse HTTP
const genererProfilPDF = (candidate, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=profil-${candidate._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text('Profil Candidate', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Nom : ${candidate.user?.nom || 'N/A'}`);
  doc.text(`Ville : ${candidate.ville}`);
  doc.text(`Âge : ${candidate.age} ans`);
  doc.text(`Expérience : ${candidate.experienceAnnees} an(s)`);
  doc.text(`Disponibilité : ${candidate.disponibilite}`);
  doc.text(`Compétences : ${candidate.competences.join(', ') || 'Non renseignées'}`);
  doc.text(`Statut : ${candidate.statut}`);
  doc.text(`Profil vérifié : ${candidate.profilVerifie ? 'Oui' : 'Non'}`);

  if (candidate.description) {
    doc.moveDown();
    doc.fontSize(14).text('Description');
    doc.fontSize(12).text(candidate.description);
  }

  doc.moveDown();
  doc.fontSize(10).fillColor('gray').text(
    `Document généré le ${new Date().toLocaleDateString('fr-FR')}`,
    { align: 'right' }
  );

  doc.end();
};

module.exports = { genererProfilPDF };
