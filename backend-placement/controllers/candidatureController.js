const CandidateProfile = require('../models/CandidateProfile');
const AgentProfile = require('../models/AgentProfile');
const User = require('../models/User');
const Candidature = require('../models/Candidature');
const Signalement = require('../models/Signalement');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// 1. Inscription & Création d'un profil candidate
exports.creerCandidature = async (req, res) => {
    try {
        const { nom, email, password, telephone, ville, age, experienceAnnees, disponibilite, description, competences } = req.body;

        const photoFile = req.files && req.files['photo'] ? req.files['photo'][0] : null;
        const pieceIdentiteFile = req.files && req.files['pieceIdentite'] ? req.files['pieceIdentite'][0] : null;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            nom,
            email,
            password: hashedPassword,
            telephone,
            role: 'candidate'
        });

        const candidateProfile = await CandidateProfile.create({
            user: newUser._id,
            ville,
            age: Number(age),
            experienceAnnees: Number(experienceAnnees || 0),
            disponibilite: disponibilite || 'temps_plein',
            description: description || '',
            competences: Array.isArray(competences) ? competences : (competences ? competences.split(',').map(c => c.trim()) : []),
            photo: photoFile ? `/uploads/photos/${photoFile.filename}` : null,
            pieceIdentite: pieceIdentiteFile ? pieceIdentiteFile.filename : null,
            pieceIdentiteFournie: !!pieceIdentiteFile,
            statut: 'en_attente'
        });

        res.status(201).json({ success: true, message: "Profil créé avec succès", data: candidateProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la création", error: error.message });
    }
};

// 2. Lister les candidates (Filtré pour l'agent)
exports.listerCandidatures = async (req, res) => {
    try {
        let query = {};

        if (req.user && req.user.role === 'agent') {
            const agentProfile = await AgentProfile.findOne({ user: req.user._id });
            
            if (agentProfile) {
                query.agent = agentProfile._id;
            } else {
                return res.status(200).json({ success: true, data: [] });
            }
        }

        const candidates = await CandidateProfile.find(query)
            .populate('user', 'nom email telephone role')
            .populate('agent', 'nomAgence logo localisation')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: candidates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Changer le statut d'une candidate
exports.changerStatutCandidature = async (req, res) => {
    try {
        const { statut } = req.body;
        const candidate = await CandidateProfile.findById(req.params.id).populate('user', 'nom email telephone role');
        if (!candidate) return res.status(404).json({ success: false, message: "Candidate introuvable" });

        candidate.statut = statut;
        await candidate.save();
        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 4. Obtenir le profil de la candidate connectée (/me)
exports.obtenirMonProfilCandidate = async (req, res) => {
    try {
        const candidate = await CandidateProfile.findOne({ user: req.user._id }).populate('user', 'nom email telephone role');
        if (!candidate) return res.status(404).json({ success: false, message: "Profil introuvable" });
        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// 5. Modifier le profil de la candidate connectée (/me)
exports.modifierMonProfilCandidate = async (req, res) => {
    try {
        const candidate = await CandidateProfile.findOne({ user: req.user._id }).populate('user', 'nom email telephone role');
        if (!candidate) return res.status(404).json({ success: false, message: "Profil introuvable" });

        const { ville, age, experienceAnnees, disponibilite, description, competences } = req.body;
        if (ville) candidate.ville = ville;
        if (age) candidate.age = Number(age);
        if (experienceAnnees !== undefined) candidate.experienceAnnees = Number(experienceAnnees);
        if (disponibilite) candidate.disponibilite = disponibilite;
        if (description) candidate.description = description;
        if (competences) {
            candidate.competences = Array.isArray(competences) ? competences : competences.split(',').map(c => c.trim());
        }
        if (req.file) {
            candidate.photo = `/uploads/photos/${req.file.filename}`;
        }

        await candidate.save();
        res.status(200).json({ success: true, message: "Profil mis à jour", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// 6. Obtenir une candidate par son ID
exports.obtenirCandidate = async (req, res) => {
    try {
        const id = req.params.id;
        let candidate = await CandidateProfile.findById(id).populate('user', 'nom email telephone role');
        if (!candidate) {
            candidate = await CandidateProfile.findOne({ user: id }).populate('user', 'nom email telephone role');
        }
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Profil introuvable" });
        }
        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// 7. Espace public (recherche)
exports.getPublicCandidates = async (req, res) => {
    try {
        const { ville, disponibilite, experienceMin } = req.query;
        let query = { statut: { $in: ['disponible', 'verifiee', 'en_attente'] } };

        if (ville) query.ville = new RegExp(ville, 'i');
        if (disponibilite) query.disponibilite = disponibilite;
        if (experienceMin) query.experienceAnnees = { $gte: Number(experienceMin) };

        const candidates = await CandidateProfile.find(query)
            .populate('user', 'nom')
            .select('ville age experienceAnnees competences disponibilite photo description statut');

        res.status(200).json({ success: true, data: candidates });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// 8. Obtenir (télécharger/voir) la pièce d'identité
exports.obtenirPieceIdentite = async (req, res) => {
    try {
        const candidate = await CandidateProfile.findById(req.params.id).select('+pieceIdentite');
        
        if (!candidate || !candidate.pieceIdentite) {
            return res.status(404).json({ success: false, message: "Pièce d'identité introuvable en base." });
        }

        const nomFichierPropre = path.basename(candidate.pieceIdentite);
        const dossiersPossibles = ['photos', 'documents', 'pieces', 'pieces_identite', ''];
        let filePathTrouve = null;

        for (const dossier of dossiersPossibles) {
            const testPath = path.join(__dirname, `../uploads/${dossier}`, nomFichierPropre);
            
            if (fs.existsSync(testPath)) {
                filePathTrouve = testPath;
                break;
            }
        }

        if (!filePathTrouve) {
            return res.status(404).json({ success: false, message: "Le fichier physique est introuvable." });
        }

        res.sendFile(filePathTrouve);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// 9. Ajouter ou mettre à jour la pièce d'identité après l'inscription
exports.ajouterPieceIdentite = async (req, res) => {
    try {
        const candidate = await CandidateProfile.findById(req.params.id).populate('user', 'nom email telephone role');
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate introuvable" });
        }

        const pieceFile = req.file;
        if (!pieceFile) {
            return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
        }

        candidate.pieceIdentite = pieceFile.filename;
        candidate.pieceIdentiteFournie = true;
        await candidate.save();

        res.status(200).json({ success: true, message: "Pièce d'identité ajoutée avec succès", data: candidate });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// =====================================================================
// FONCTIONS POUR LA GESTION DES DEMANDES DE RECRUTEMENT
// =====================================================================

exports.creerDemandeRecrutement = async (req, res) => {
    try {
        const { candidate, agent, annonce, message } = req.body;
        const employeurId = req.user._id;

        const nouvelleCandidature = await Candidature.create({
            employeur: employeurId,
            candidate: candidate,
            agent: agent,
            annonce: annonce || null,
            message: message || "Demande de recrutement ciblée",
            statut: 'en_attente'
        });

        res.status(201).json({ success: true, message: "Demande envoyée à l'agent avec succès", data: nouvelleCandidature });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la création de la demande", error: error.message });
    }
};

exports.listerDemandesAgent = async (req, res) => {
    try {
        const agent = await AgentProfile.findOne({ user: req.user._id });
        const agentId = agent ? agent._id : (req.user.profileId || req.user._id);

        const candidatures = await Candidature.find({ agent: agentId })
            .populate({
                path: 'candidate',
                select: 'ville age photo competences',
                populate: { path: 'user', select: 'nom email telephone' }
            })
            .populate('employeur', 'nom email telephone')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: candidatures });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// =====================================================================
// NOUVELLES FONCTIONS POUR LES CANDIDATES INDÉPENDANTES
// =====================================================================

exports.listerCandidaturesSpontanees = async (req, res) => {
    try {
        const candidatesSansAgence = await CandidateProfile.find({
            $or: [{ agent: { $exists: false } }, { agent: null }]
        }).lean().sort({ createdAt: -1 });

        const userIds = candidatesSansAgence.map(c => c.user).filter(Boolean);
        const users = await User.find({ _id: { $in: userIds } }).select('nom email telephone').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const data = candidatesSansAgence.map(c => ({
            ...c,
            user: c.user ? userMap.get(c.user.toString()) || null : null
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

exports.integrerCandidate = async (req, res) => {
    try {
        const agent = await AgentProfile.findOne({ user: req.user._id });
        if (!agent) {
            return res.status(404).json({ message: 'Profil agent introuvable' });
        }

        let candidate = await CandidateProfile.findById(req.params.id);
        if (!candidate) {
            candidate = await CandidateProfile.findOne({ user: req.params.id });
        }

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate introuvable' });
        }

        candidate.agent = agent._id;
        candidate.statut = 'verifiee';
        await candidate.save();

        res.status(200).json({
            success: true,
            message: 'Candidate intégrée avec succès à votre agence !',
            data: candidate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================================
// 14. GESTION DES SIGNALEMENTS (Traçabilité Admin complète)
// =====================================================================
exports.signalerCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { motif, emailSignaleur, signaleurId } = req.body;

        if (!motif) {
            return res.status(400).json({ success: false, message: "Le motif est obligatoire." });
        }

        const nouveauSignalement = await Signalement.create({
            cibleType: 'candidate',
            cibleId: id,
            motif,
            emailSignaleur: emailSignaleur || '',
            signalePar: signaleurId || null
        });

        res.status(201).json({ 
            success: true, 
            message: "Votre signalement a bien été pris en compte.",
            data: nouveauSignalement 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors du signalement", error: error.message });
    }
};

// Permet à l'admin de lister les signalements avec la traçabilité complète (Candidate, Agent et Auteur)
exports.listerSignalementsAdmin = async (req, res) => {
    try {
        const signalements = await Signalement.find()
            .populate('signalePar', 'nom email role')
            .sort({ createdAt: -1 });

        const signalementsEnrichis = await Promise.all(signalements.map(async (sig) => {
            let nomCible = "Profil introuvable";
            let detailsCible = null; 
            let agentConcerne = null;

            if (sig.cibleType === 'candidate') {
                const candidateProfile = await CandidateProfile.findById(sig.cibleId)
                    .populate('user', 'nom email telephone')
                    .populate('agent', 'nomAgence urlPersonnalisee localisation');

                if (candidateProfile) {
                    nomCible = candidateProfile.user ? candidateProfile.user.nom : "Candidate sans nom";
                    detailsCible = candidateProfile; 
                    agentConcerne = candidateProfile.agent || null;
                }
            }

            return {
                ...sig.toObject(),
                nomCible,
                detailsCible,
                agentConcerne
            };
        }));

        res.status(200).json({ success: true, data: signalementsEnrichis });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};