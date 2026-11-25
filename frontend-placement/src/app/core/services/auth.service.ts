import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Role } from '../models';

const CLE_STOCKAGE = 'placement_auth';

interface SessionStockee {
  token: string;
  _id: string;
  nom: string;
  email: string;
  role: Role;
  emailVerifie?: boolean; // <-- Ajouté ici
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<SessionStockee | null>(this.lireSessionStockee());

  readonly utilisateur = computed(() => this.session());
  readonly estConnecte = computed(() => !!this.session());
  readonly role = computed(() => this.session()?.role ?? null);

  constructor(private http: HttpClient) {}

  private lireSessionStockee(): SessionStockee | null {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      return brut ? (JSON.parse(brut) as SessionStockee) : null;
    } catch {
      return null;
    }
  }

  private enregistrerSession(reponse: any) {
    const session: SessionStockee = {
      token: reponse.token,
      _id: reponse._id,
      nom: reponse.nom,
      email: reponse.email,
      role: reponse.role,
      emailVerifie: reponse.emailVerifie, // <-- Ajouté ici
    };
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(session));
    this.session.set(session);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((reponse) => this.enregistrerSession(reponse)));
  }

  registerAgent(payload: {
    nom: string;
    email: string;
    password: string;
    telephone?: string;
    nomAgence: string;
    localisation: string;
    description?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register-agent`, payload)
      .pipe(tap((reponse) => this.enregistrerSession(reponse)));
  }

  registerCandidate(formData: FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register-candidate`, formData)
      .pipe(tap((reponse) => this.enregistrerSession(reponse)));
  }

  // ---- NOUVELLE MÉTHODE DE VÉRIFICATION EMAIL (SOFT LOCK) ----
  verifyEmail(code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/verify-email`, { code }).pipe(
      tap(() => {
        const currentSession = this.session();
        if (currentSession) {
          const updatedSession = { ...currentSession, emailVerifie: true };
          localStorage.setItem(CLE_STOCKAGE, JSON.stringify(updatedSession));
          this.session.set(updatedSession);
        }
      })
    );
  }

  // ---- MÉTHODES MOT DE PASSE OUBLIÉ ----
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/auth/reset-password/${token}`, { password });
  }

  logout() {
    localStorage.removeItem(CLE_STOCKAGE);
    this.session.set(null);
  }

  getToken(): string | null {
    return this.session()?.token ?? null;
  }

  aLeRole(...roles: Role[]): boolean {
    const role = this.role();
    return !!role && roles.includes(role);
  }
}