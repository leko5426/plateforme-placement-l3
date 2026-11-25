import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentProfile, StatistiquesAdmin, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  listerAgents(statutValidation?: string): Observable<AgentProfile[]> {
    const params = statutValidation ? { params: { statutValidation } } : {};
    return this.http.get<AgentProfile[]>(`${this.base}/agents`, params);
  }

  listerUtilisateurs(role?: string): Observable<User[]> {
    const params = role ? { params: { role } } : {};
    return this.http.get<User[]>(`${this.base}/users`, params);
  }

  validerAgent(id: string, statutValidation: 'valide' | 'rejete'): Observable<AgentProfile> {
    return this.http.patch<AgentProfile>(`${this.base}/agents/${id}/validation`, { statutValidation });
  }

  changerStatutUtilisateur(id: string, actif: boolean): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/${id}/statut`, { actif });
  }

  obtenirStatistiques(): Observable<StatistiquesAdmin> {
    return this.http.get<StatistiquesAdmin>(`${this.base}/stats`);
  }
}
