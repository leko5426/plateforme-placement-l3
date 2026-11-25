import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ---- Public ----
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then((m) => m.HomeComponent),
    title: 'Accueil — Plateforme Aide-Ménagères',
  },
  {
    path: 'agences',
    loadComponent: () =>
      import('./features/public/agent-list/agent-list.component').then((m) => m.AgentListComponent),
    title: 'Nos agences partenaires',
  },
  {
    path: 'agences/:slug',
    loadComponent: () =>
      import('./features/public/agent-profile/agent-profile.component').then((m) => m.AgentProfileComponent),
    title: 'Fiche agence',
  },
  {
    path: 'candidates',
    loadComponent: () =>
      import('./features/public/candidate-search/candidate-search.component').then(
        (m) => m.CandidateSearchComponent
      ),
    title: 'Trouver une aide-ménagère',
  },
  {
    path: 'candidates/:id',
    loadComponent: () =>
      import('./features/public/candidate-detail/candidate-detail.component').then(
        (m) => m.CandidateDetailComponent
      ),
    title: 'Profil candidate',
  },
  {
    path: 'annonce/nouvelle',
    loadComponent: () =>
      import('./features/public/annonce-create/annonce-create.component').then(
        (m) => m.AnnonceCreateComponent
      ),
    title: 'Publier une demande de personnel',
  },

  // ---- Authentification ----
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Connexion',
  },
  {
    path: 'inscription/agent',
    loadComponent: () =>
      import('./features/auth/register-agent/register-agent.component').then(
        (m) => m.RegisterAgentComponent
      ),
    title: 'Devenir agent de placement',
  },
  {
    path: 'inscription/candidate',
    loadComponent: () =>
      import('./features/auth/register-candidate/register-candidate.component').then(
        (m) => m.RegisterCandidateComponent
      ),
    title: 'Créer mon profil candidate',
  },
  
  // ---- NOUVELLES ROUTES MOT DE PASSE OUBLIÉ ----
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () =>
      import('./components/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    title: 'Mot de passe oublié',
  },
  {
    path: 'reinitialiser-mot-de-passe/:token',
    loadComponent: () =>
      import('./components/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
    title: 'Nouveau mot de passe',
  },
  // ----------------------------------------------

  // ---- Espace Employeur (Lien Magique) ----
  {
    path: 'suivi-employeur',
    loadComponent: () =>
      import('./features/employeur/suivi-employeur/suivi-employeur.component').then(
        (m) => m.SuiviEmployeurComponent
      ),
    title: 'Mon Espace de Suivi',
  },
  // ----------------------------------------------

  // ---- Espace Agent ----
  {
    path: 'agent',
    canActivate: [roleGuard(['agent'])],
    loadComponent: () => import('./features/agent/layout/agent-layout.component').then((m) => m.AgentLayoutComponent),
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/agent/dashboard/agent-dashboard.component').then((m) => m.AgentDashboardComponent),
        title: 'Tableau de bord agent',
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./features/agent/profile-edit/agent-profile-edit.component').then(
            (m) => m.AgentProfileEditComponent
          ),
        title: 'Mon profil agence',
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('./features/agent/candidates-list/agent-candidates-list.component').then(
            (m) => m.AgentCandidatesListComponent
          ),
        title: 'Mes candidates',
      },
      {
        path: 'candidates/nouvelle',
        loadComponent: () =>
          import('./features/agent/candidate-add/agent-candidate-add.component').then(
            (m) => m.AgentCandidateAddComponent
          ),
        title: 'Ajouter une candidate',
      },
      {
        path: 'candidatures',
        loadComponent: () =>
          import('./features/agent/candidatures-list/agent-candidatures-list.component').then(
            (m) => m.AgentCandidaturesListComponent
          ),
        title: 'Candidatures reçues',
      },
      {
        path: 'demandes',
        loadComponent: () =>
          import('./features/annonces/annonces-list.component').then((m) => m.AnnoncesListComponent),
        title: "Demandes d'employeurs",
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/chat/chat.component').then((m) => m.ChatComponent),
        title: 'Messagerie',
      },
    ],
  },

  // ---- Espace Candidate ----
  {
    path: 'candidate',
    canActivate: [roleGuard(['candidate'])],
    loadComponent: () =>
      import('./features/candidate/layout/candidate-layout.component').then((m) => m.CandidateLayoutComponent),
    children: [
      { path: '', redirectTo: 'profil', pathMatch: 'full' },
      {
        path: 'profil',
        loadComponent: () =>
          import('./features/candidate/profile-edit/candidate-profile-edit.component').then(
            (m) => m.CandidateProfileEditComponent
          ),
        title: 'Mon profil',
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/chat/chat.component').then((m) => m.ChatComponent),
        title: 'Messagerie',
      },
    ],
  },

  // ---- Espace Admin ----
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
        title: 'Tableau de bord admin',
      },
      {
        path: 'agents',
        loadComponent: () =>
          import('./features/admin/agents-validation/admin-agents-validation.component').then(
            (m) => m.AdminAgentsValidationComponent
          ),
        title: 'Validation des agents',
      },
      {
        path: 'demandes',
        loadComponent: () =>
          import('./features/annonces/annonces-list.component').then((m) => m.AnnoncesListComponent),
        title: "Demandes d'employeurs",
      },
      {
        path: 'signalements',
        loadComponent: () =>
          import('./features/admin/signalements/admin-signalements.component').then(
            (m) => m.AdminSignalementsComponent
          ),
        title: 'Signalements',
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
        title: 'Utilisateurs',
      },
    ],
  },

  {
    path: '404',
    loadComponent: () => import('./features/public/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page introuvable',
  },
  { path: '**', redirectTo: '404' },
];