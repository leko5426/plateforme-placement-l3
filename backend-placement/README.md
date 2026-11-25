# API — Plateforme de placement d'aide-ménagères

Backend Node.js + Express + MongoDB Atlas + Socket.io pour la plateforme mettant en relation candidates (aide-ménagères), agents de placement et employeurs.

## 🧱 Stack technique

- **Node.js** + **Express** — serveur et API REST
- **MongoDB Atlas** — base de données en ligne (cloud)
- **Mongoose** — ODM
- **Socket.io** — chat en temps réel agent ↔ candidate
- **JWT** + **bcryptjs** — authentification et sécurité des mots de passe
- **Multer** — upload de photos/logos (stockage local)
- **PDFKit** — export de profil candidate en PDF
- **Nodemailer** — notifications par email

> Le cahier des charges initial proposait Symfony/MySQL ; ce backend a été construit en Node.js/MongoDB Atlas à la demande explicite du porteur de projet.

## 📁 Structure du projet

```
backend-placement/
├── config/
│   ├── db.js            # Connexion MongoDB Atlas
│   └── socket.js         # Logique du chat temps réel
├── controllers/
├── middleware/
│   ├── auth.js            # JWT (protect + protectOptionnel pour employeurs anonymes)
│   ├── roles.js           # Contrôle d'accès par rôle
│   ├── upload.js          # Upload photos/logos (local)
│   └── visiteTracker.js   # Tracking des visites pour les stats admin
├── models/
├── routes/
├── utils/
│   ├── sendEmail.js
│   ├── generateSlug.js    # URL personnalisée unique par agent
│   └── generatePdf.js     # Export PDF du profil candidate
├── seed/
│   └── createAdmin.js     # Script pour créer le 1er compte admin
├── uploads/photos/         # Fichiers uploadés (photos, logos)
├── .env.example
├── package.json
└── server.js
```

## 🚀 Étape 1 — Créer la base MongoDB Atlas (en ligne)

1. Crée un compte sur https://www.mongodb.com/cloud/atlas/register
2. Crée un cluster gratuit (M0)
3. **Database Access** → crée un utilisateur (nom + mot de passe)
4. **Network Access** → autorise ton IP, ou `0.0.0.0/0` en développement
5. **Connect > Drivers** → copie l'URI et ajoute le nom de la base après le `/` :
   ```
   mongodb+srv://<user>:<password>@<cluster>/placement_menageres?retryWrites=true&w=majority
   ```

## ⚙️ Étape 2 — Installation

```bash
cd backend-placement
npm install
cp .env.example .env
```

Remplis le `.env` :
- `MONGODB_URI` : ton URI Atlas
- `JWT_SECRET` : chaîne aléatoire longue
- `EMAIL_*` : identifiants SMTP (Gmail : utiliser un mot de passe d'application)
- `ADMIN_EMAIL` : email qui recevra les notifications admin (nouveaux agents, demandes générales)

## 👤 Étape 3 — Créer le compte admin initial

Il n'existe pas de route publique pour créer un admin (sécurité). Utilise le script fourni :

```bash
node seed/createAdmin.js
```

Cela crée un compte avec le mot de passe temporaire `ChangeMoi123!` — à changer immédiatement.

## ▶️ Étape 4 — Lancer le serveur

```bash
npm run dev     # avec rechargement automatique
# ou
npm start
```

Serveur disponible sur `http://localhost:5000`. Les fichiers uploadés sont servis sur `http://localhost:5000/uploads/photos/...`.

## 📡 Vue d'ensemble des endpoints

### Authentification (`/api/auth`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/register-agent` | Public | Inscription agent (statut `en_attente`, admin notifié) |
| POST | `/register-candidate` | Public | Inscription candidate (générale ou via `agentSlug`) |
| POST | `/login` | Public | Connexion (tous rôles) |
| GET | `/me` | Privé | Profil connecté |

### Agents (`/api/agents`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | Public | Liste des agents validés (filtre `?localisation=`) |
| GET | `/me/profil` | Agent | Son profil |
| PUT | `/me/profil` | Agent | Modifier son profil (logo, nom, localisation) |
| GET | `/me/dashboard` | Agent | Statistiques (candidates, vues, candidatures) |
| GET | `/me/candidates` | Agent | Ses candidates (filtre `?statut=`) |
| POST | `/me/candidates` | Agent | Ajouter une candidate manuellement |
| GET | `/:slug` | Public | Fiche publique via URL personnalisée (ex: `/agent/mamadou`) |

### Candidates (`/api/candidates`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | Public | Recherche filtrée (`ville`, `ageMin`, `ageMax`, `experienceMin`, `disponibilite`) |
| GET | `/:id` | Public | Détail d'une candidate |
| PUT | `/me` | Candidate | Modifier son propre profil |
| PATCH | `/:id/statut` | Agent/Admin | Changer statut (`verifiee`/`archivee`/`placee`) |
| GET | `/:id/export-pdf` | Agent/Admin/Employeur | Export PDF du profil |

### Annonces (`/api/annonces`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/` | Public | Créer une demande de personnel (employeur, avec ou sans compte) |
| GET | `/` | Agent/Admin | Lister les annonces |
| PUT | `/:id` | Agent/Admin | Modifier / changer le statut |
| DELETE | `/:id` | Admin | Supprimer |

### Candidatures (`/api/candidatures`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/` | Candidate | Postuler auprès d'un agent / à une annonce |
| GET | `/` | Agent/Admin | Lister les candidatures reçues |
| PATCH | `/:id/statut` | Agent/Admin | Accepter / refuser (email auto à la candidate) |

### Conversations & chat (`/api/conversations`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/` | Privé | Démarrer/récupérer une conversation avec un utilisateur |
| GET | `/` | Privé | Lister ses conversations |
| GET | `/:id/messages` | Privé | Historique des messages |

**Chat en temps réel (Socket.io)** — se connecter avec `auth: { token: '<jwt>' }`, puis événements :
- `rejoindre_conversation` (émettre avec `conversationId`)
- `envoyer_message` (émettre avec `{ conversationId, contenu }`)
- `nouveau_message` (écouter, reçu par tous les participants)
- `en_train_decrire` (indicateur de frappe)

### Admin (`/api/admin`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/agents` | Admin | Lister agents (filtre `?statutValidation=en_attente`) |
| PATCH | `/agents/:id/validation` | Admin | Valider/rejeter un agent (email auto) |
| PATCH | `/users/:id/statut` | Admin | Activer/désactiver un compte |
| GET | `/stats` | Admin | Statistiques globales (visites, inscriptions, par catégorie) |

### Signalements (`/api/signalements`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/` | Public | Signaler un abus (agent, candidate, annonce) |
| GET | `/` | Admin | Lister les signalements |
| PATCH | `/:id` | Admin | Traiter un signalement |

## 🔐 Authentification

Header requis pour les routes privées :
```
Authorization: Bearer <token_jwt>
```

## 👥 Rôles

- **admin** — supervision complète de la plateforme
- **agent** — gère ses candidates, son profil, ses candidatures reçues
- **candidate** — gère son profil, postule, discute avec les agents
- **employeur** — optionnel ; peut publier des annonces même sans compte

## 📧 Notifications automatiques par email

- Nouvel agent inscrit → email à l'admin
- Candidate inscrite via le lien d'un agent → email à l'agent
- Candidature reçue → email à l'agent concerné
- Candidature acceptée/refusée → email à la candidate
- Agent validé/rejeté → email à l'agent
- Nouvelle annonce (générale) → email à l'admin ; (ciblée) → email à l'agent

## 🌐 Déploiement

Déployable sur Render, Railway ou Fly.io. Pense à configurer les mêmes variables d'environnement que dans `.env`, et à monter un volume persistant si tu gardes le stockage local des photos (sinon les fichiers seront perdus au redéploiement — envisage Cloudinary ou S3 pour la production).
