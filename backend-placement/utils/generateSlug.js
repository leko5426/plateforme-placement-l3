const slugify = require('slugify');
const AgentProfile = require('../models/AgentProfile');

// Génère un slug unique à partir du nom de l'agence, en ajoutant un suffixe numérique si besoin
const genererSlugUnique = async (nomAgence) => {
  const base = slugify(nomAgence, { lower: true, strict: true });
  let slug = base;
  let compteur = 1;

  while (await AgentProfile.findOne({ urlPersonnalisee: slug })) {
    slug = `${base}-${compteur}`;
    compteur += 1;
  }

  return slug;
};

module.exports = { genererSlugUnique };
