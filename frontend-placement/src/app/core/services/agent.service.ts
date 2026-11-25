import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentProfile, DashboardAgent, CandidateProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly base = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  lister(localisation?: string): Observable<AgentProfile[]> {
    const params = localisation ? { params: { localisation } } : {};
    return this.http.get<AgentProfile[]>(this.base, params);
  }

  obtenirParSlug(slug: string): Observable<AgentProfile> {
    return this.http.get<AgentProfile>(`${this.base}/${slug}`);
  }

  monProfil(): Observable<AgentProfile> {
    return this.http.get<AgentProfile>(`${this.base}/me/profil`);
  }

  modifierMonProfil(formData: FormData): Observable<AgentProfile> {
    return this.http.put<AgentProfile>(`${this.base}/me/profil`, formData);
  }

  monDashboard(): Observable<DashboardAgent> {
    return this.http.get<DashboardAgent>(`${this.base}/me/dashboard`);
  }

  mesCandidates(statut?: string): Observable<CandidateProfile[]> {
    const params = statut ? { params: { statut } } : {};
    return this.http.get<CandidateProfile[]>(`${this.base}/me/candidates`, params);
  }

  ajouterCandidate(formData: FormData): Observable<CandidateProfile> {
    return this.http.post<CandidateProfile>(`${this.base}/me/candidates`, formData);
  }
}
