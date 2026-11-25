export type Role = 'admin' | 'agent' | 'candidate' | 'employeur';

export interface User {
  _id: string;
  nom: string;
  email: string;
  telephone?: string;
  role: Role;
  actif?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  _id: string;
  nom: string;
  email: string;
  role: Role;
  token: string;
}

export interface AgentProfile {
  _id: string;
  user: User | string;
  nomAgence: string;
  logo?: string | null;
  localisation: string;
  description?: string;
  urlPersonnalisee: string;
  statutValidation: 'en_attente' | 'valide' | 'rejete';
  vues: number;
  createdAt?: string;
}

export type StatutCandidate = 'en_attente' | 'verifiee' | 'archivee' | 'placee';
export type Disponibilite = 'temps_plein' | 'temps_partiel' | 'ponctuel';

export interface CandidateProfile {
  _id: string;
  user: User | string;
  photo?: string | null;
  ville: string;
  age: number;
  experienceAnnees: number;
  competences: string[];
  disponibilite: Disponibilite;
  agent?: AgentProfile | string | null;
  statut: StatutCandidate;
  profilVerifie: boolean;
  pieceIdentiteFournie?: boolean;
  description?: string;
  createdAt?: string;
}

export interface Annonce {
  _id: string;
  employeur: {
    nom: string;
    entreprise?: string;
    email: string;
    telephone?: string;
  };
  titre: string;
  description: string;
  localisation: string;
  criteres: {
    ageMin: number;
    ageMax: number;
    experienceMin: number;
  };
  candidateCible?: CandidateProfile | string | null;
  agentDestinataire?: AgentProfile | string | null;
  statut: 'nouvelle' | 'en_traitement' | 'cloturee';
  createdAt?: string;
}

export interface Candidature {
  _id: string;
  candidate: CandidateProfile;
  agent?: AgentProfile | string | null;
  annonce?: Annonce | string | null;
  message?: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  dernierMessage: string;
  dateMaj: string;
}

export interface Message {
  _id: string;
  conversation: string;
  expediteur: User;
  contenu: string;
  lu: boolean;
  createdAt: string;
}

export interface Signalement {
  _id: string;
  signalePar?: User | string | null;
  emailSignaleur?: string;
  cibleType: 'agent' | 'candidate' | 'annonce';
  cibleId: string;
  motif: string;
  statut: 'en_attente' | 'traite' | 'rejete';
  commentaireAdmin?: string;
  createdAt?: string;
}

export interface StatistiquesAdmin {
  nombreAgents: number;
  nombreAgentsEnAttente: number;
  nombreCandidates: number;
  candidatesParStatut: { _id: string; total: number }[];
  nombreAnnonces: number;
  visitesParCategorie: { _id: string; total: number }[];
  totalVisites: number;
}

export interface DashboardAgent {
  nombreCandidates: number;
  vuesFiche: number;
  candidatesParStatut: { _id: string; total: number }[];
  nombreCandidaturesEnAttente: number;
  statutValidation: string;
}