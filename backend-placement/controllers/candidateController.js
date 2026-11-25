const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const AgentProfile = require('../models/AgentProfile');
const Signalement = require('../models/Signalement'); // NOUVEAU : Import du modèle
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. INSCRIPTION & GESTION DES CANDIDATURES
// ==========================================

exports.creerCandidature = async (req, res) => {
    try {
        const { nom, email, password, telephone, ville, age, experienceAnnees, disponibilite, description, competences } = req.body;

        const photoFile = req.files && req.files['photo'] ? req.files['photo'][0] : null;
        const pieceIdentiteFile = req.files && req.files['pieceIdentite'] ? req.files['pieceIdentite'][0] : null;

        if (!pieceIdentiteFile) {
            return res.status(400).json({ success: false, message: "La pièce d'identité est obligatoire." });
        }

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
            pieceIdentite: pieceIdentiteFile.filename,
            pieceIdentiteFournie: true,
            statut: 'en_attente',
            agent: null
        });

        res.status(201).json({ 
            success: true, 
            message: "Profil de candidate créé avec succès", 
            data: candidateProfile 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la création du profil", error: error.message });
    }
};

exports.listerCandidatures = async (req, res) => {
    try {
        const candidates = await CandidateProfile.find().populate('user', 'nom email telephone');
        res.status(200).json({ success: true, data: candidates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changerStatutCandidature = async (req, res) => {
    try {
        const { statut } = req.body;
        const candidate = await CandidateProfile.findById(req.params.id);
        if (!candidate) return res.status(404).json({ success: false, message: "Candidate introuvable" });

        candidate.statut = statut;
        await candidate.save();
        res.status(200).json({ success: true, data: candidate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. ESPACE PUBLIC & SOUMISSION D'OFFRE
// ==========================================

exports.getPublicCandidates = async (req, res) => {
    try {
        const { ville, disponibilite, experienceMin } = req.query;
        let query = { statut: { $in: ['disponible', 'verifiee'] } };

        if (ville) query.ville = new RegExp(ville, 'i');
        if (disponibilite) query.disponibilite = disponibilite;
        if (experienceMin) query.experienceAnnees = { $gte: Number(experienceMin) };

        const candidates = await CandidateProfile.find(query)
            .populate({
                path: 'user',
                select: 'nom emailVerifie',
                match: { emailVerifie: true } 
            })
            .populate('agent', 'nomAgence localisation')
            .select('ville age experienceAnnees competences disponibilite photo agent description statut');

        const candidatesVerifiees = candidates.filter(c => c.user !== null);

        res.status(200).json({ success: true, data: candidatesVerifiees });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

exports.submitOfferToCandidateAgent = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { nom_empl, pren_empl, age_empl, contact_empl, email_empl, loca_empl, description_ann, criteres_ann, dat_limite_ann } = req.body;

        const candidate = await CandidateProfile.findById(candidateId).populate('user agent');
        if (!candidate) return res.status(404).json({ success: false, message: "Candidate introuvable." });

        const suiviToken = crypto.randomBytes(32).toString('hex');

        const nouvelleAnnonce = await Annonce.create({
            libelle_ann: `Besoin pour profil de référence ID: ${candidateId}`,
            description_ann,
            loca_ann: loca_empl,
            criteres_ann,
            dat_limite_ann,
            id_ag: candidate.agent ? candidate.agent._id : null,
            employeur_infos: { nom_empl, pren_empl, age_empl, contact_empl, email_empl, loca_empl, suiviToken }
        });

        const lienSuivi = `http://localhost:4200/suivi-demande/${suiviToken}`;
        await sendEmail({
            to: email_empl,
            subject: "Confirmation de votre demande d'aide-ménagère",
            htmlContent: `<p>Bonjour ${pren_empl} ${nom_empl},</p>
                          <p>Votre demande concernant la candidate a bien été transmise à l'agence.</p>
                          <p><a href="${lienSuivi}">Accéder à mon espace de suivi sécurisé</a></p>`,
            type_notif: 'confirmation_demande'
        });

        res.status(201).json({ success: true, message: "Votre demande a été transmise avec succès.", data: nouvelleAnnonce });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la soumission", error: error.message });
    }
};

// =====================================================================
// 3. MENU "CANDIDATURES REÇUES" : RECRUTEMENT DES FILLES SANS AGENCE
// =====================================================================

exports.listerCandidaturesSpontanees = async (req, res) => {
    try {
        const candidatesSansAgence = await CandidateProfile.find({
            $or: [
                { agent: { $exists: false } },
                { agent: null }
            ]
        })
        .lean()
        .sort({ createdAt: -1 });

        const userIds = candidatesSansAgence.map(c => c.user).filter(Boolean);
        
        const users = await User.find({ _id: { $in: userIds }, emailVerifie: true }).select('nom email telephone emailVerifie').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const data = candidatesSansAgence.map(c => ({
            ...c,
            user: c.user ? userMap.get(c.user.toString()) || null : null
        })).filter(c => c.user !== null); 

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

exports.integrerCandidate = async (req, res) => {
    try {
        const agentProfile = await AgentProfile.findOne({ user: req.user._id });
        if (!agentProfile) {
            return res.status(404).json({ success: false, message: "Profil Agent introuvable." });
        }

        const updatedCandidate = await CandidateProfile.findOneAndUpdate(
            { $or: [{ _id: req.params.id }, { user: req.params.id }] },
            { 
                $set: { 
                    agent: agentProfile._id,
                    statut: 'verifiee' 
                } 
            },
            { new: true } 
        );

        if (!updatedCandidate) {
            return res.status(404).json({ success: false, message: "Candidate introuvable" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Candidate intégrée avec succès à votre agence !", 
            data: updatedCandidate 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

// ==========================================
// 4. GESTION DES SIGNALEMENTS
// ==========================================

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