import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Candidature } from '../models';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private readonly base = `${environment.apiUrl}/candidatures`; 
  private readonly apiUrl = environment.apiUrl; // URL de base pour les routes de candidates

  constructor(private http: HttpClient) {}

  // Pour la page "Candidatures reçues" (les profils des filles)
  listerCandidaturesFilles(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.base);
  }

  // Pour la page "Demandes de recrutement reçues" (les employeurs qui ciblent une candidate)
  listerDemandesEmployeursAgent(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/agent/demandes`);
  }

  // Changer le statut d'une candidature ou d'une demande
  changerStatut(id: string, statut: 'acceptee' | 'refusee' | 'verifiee'): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}/statut`, { statut });
  }

  // Lister les candidates sans agence pour "Candidatures reçues"
  listerCandidaturesSpontanees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidates/independantes`);
  }

  // Intégrer une candidate indépendante à son agence
  integrerCandidate(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/candidates/${id}/integrer`, {});
  }
}