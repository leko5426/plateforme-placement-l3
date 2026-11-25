import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Signalement } from '../models';

@Injectable({ providedIn: 'root' })
export class SignalementService {
  private readonly base = `${environment.apiUrl}/signalements`;

  constructor(private http: HttpClient) {}

  creer(payload: {
    cibleType: 'agent' | 'candidate' | 'annonce';
    cibleId: string;
    motif: string;
    emailSignaleur?: string;
  }): Observable<Signalement> {
    return this.http.post<Signalement>(this.base, payload);
  }

  lister(statut?: string): Observable<Signalement[]> {
    const params = statut ? { params: { statut } } : {};
    return this.http.get<Signalement[]>(this.base, params);
  }

  traiter(id: string, statut: 'traite' | 'rejete', commentaireAdmin?: string): Observable<Signalement> {
    return this.http.patch<Signalement>(`${this.base}/${id}`, { statut, commentaireAdmin });
  }
}
