# Frontend — Plateforme de placement d'aide-ménagères

Application Angular 17 (standalone components, TypeScript) avec Bootstrap 5, connectée au backend Node.js/Express/MongoDB Atlas déjà livré.

## 🧱 Stack technique

- **Angular 17** — standalone components, lazy loading, `@if`/`@for` (control flow natif)
- **Bootstrap 5** + **Bootstrap Icons** — mise en page et composants UI
- **Socket.io-client** — chat en temps réel
- **RxJS** — gestion des flux asynchrones
- **Signals Angular** — état réactif local des composants

## 🎨 Identité visuelle

Palette personnalisée (pas le Bootstrap bleu par défaut) :
- **Teal profond** `#0F5C4C` — confiance, soin (couleur primaire)
- **Ambre chaud** `#E8A648` — accueil, chaleur (accent)
- **Fond sable** `#F7F5F0`, texte anthracite `#1E2521`
- Typo : **Sora** (titres), **Inter** (texte courant), **IBM Plex Mono** (chiffres/statistiques)
- Signature : liseré tricolore (teal/ambre/teal) sous le hero et en bordure de cartes

Tous les tokens sont dans `src/styles.scss`.

## 📁 Structure du projet

```
src/app/
├── core/
│   ├── models/           # Interfaces TypeScript (User, AgentProfile, CandidateProfile...)
│   ├── services/         # Auth, Agent, Candidate, Annonce, Candidature, Admin, Signalement, Conversation
│   ├── guards/            # authGuard, roleGuard
│   └── interceptors/      # JWT + gestion d'erreurs centralisée
├── shared/components/     # Navbar, Footer, Toast, Spinner, StatCard, EmptyState, StarBadge, ConfirmDialog
├── features/
│   ├── public/            # Accueil, agences, candidates, détail, annonce employeur, 404
│   ├── auth/               # Connexion, inscription agent, inscription candidate
│   ├── agent/               # Layout + dashboard + profil + candidates + candidatures
│   ├── candidate/            # Layout + profil
│   ├── admin/                # Layout + dashboard + validation agents + utilisateurs + signalements
│   └── chat/                  # Messagerie temps réel partagée agent/candidate
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

## 🚀 Installation

```bash
cd frontend-placement
npm install
```

Configure l'URL de ton backend dans `src/environments/environment.ts` :
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000',
};
```

## ▶️ Lancer en développement

```bash
npm start
```

L'application démarre sur `http://localhost:4200`. Assure-toi que le **backend tourne en parallèle** sur `http://localhost:5000` (voir le README du backend).

## 🏗️ Build de production

```bash
npm run build
```

Les fichiers sont générés dans `dist/frontend-placement-menageres`. Pense à renseigner la bonne URL dans `src/environments/environment.prod.ts` avant de builder.

## 🗺️ Vue d'ensemble des espaces

### Public (sans compte)
- `/` — Accueil
- `/agences` — Liste des agences validées (filtre par localisation)
- `/agences/:slug` — Fiche publique d'une agence (URL personnalisée)
- `/candidates` — Recherche de candidates (filtres ville/âge/expérience/disponibilité)
- `/candidates/:id` — Détail d'une candidate (+ signalement)
- `/annonce/nouvelle` — Publier une demande de personnel (employeur, sans compte)

### Authentification
- `/connexion`
- `/inscription/agent` — Compte en attente de validation admin après inscription
- `/inscription/candidate` — Supporte `?agent=slug` pour rattacher automatiquement à une agence

### Espace Agent (`/agent/**`, rôle `agent`)
- Tableau de bord (statistiques), profil d'agence, liste des candidates, ajout de candidate, candidatures reçues, messagerie

### Espace Candidate (`/candidate/**`, rôle `candidate`)
- Mon profil, messagerie

### Espace Admin (`/admin/**`, rôle `admin`)
- Tableau de bord global, validation des agences, gestion des utilisateurs, signalements

## 🔌 Chat temps réel

Le `ConversationService` se connecte à Socket.io avec le token JWT en poignée de main (`auth: { token }`). Les événements utilisés correspondent exactement à ceux du backend :
`rejoindre_conversation`, `envoyer_message`, `nouveau_message`, `en_train_decrire`.

## ⚠️ Deux petites routes ajoutées côté backend

Pour que ce frontend fonctionne pleinement, deux routes ont été ajoutées au backend (absentes de la version précédente) :
- `GET /api/candidates/me` — pour que la candidate récupère son propre profil avant modification
- `GET /api/admin/users` — pour que l'admin liste tous les utilisateurs (activation/désactivation)

Pense à redéployer le backend avec ces ajouts si tu utilises une version déjà en ligne.

## 🔐 Authentification

Le token JWT est stocké en `localStorage` (clé `placement_auth`) et injecté automatiquement dans chaque requête HTTP via `authInterceptor`. En cas de 401, la session est effacée et l'utilisateur redirigé vers `/connexion`.

## 📸 Upload de photos/logos

Les formulaires d'inscription candidate, d'ajout de candidate par un agent, et d'édition de profil (agent/candidate) envoient les fichiers en `multipart/form-data`, compatible avec le stockage local (`multer`) du backend.

## 🌐 Déploiement

Déployable sur Vercel, Netlify, ou tout hébergeur de fichiers statiques après `npm run build`. Pense à configurer `environment.prod.ts` avec l'URL réelle du backend avant de builder, et à activer CORS côté backend pour le domaine de production.
