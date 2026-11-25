import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateProfile, StatutCandidate } from '../models';

export interface FiltresCandidate {
  ville?: string;
  ageMin?: number;
  ageMax?: number;
  experienceMin?: number;
  disponibilite?: string;
}

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly base = `${environment.apiUrl}/candidates`;

  constructor(private http: HttpClient) {}

  rechercher(filtres: FiltresCandidate): Observable<CandidateProfile[]> {
    const params: Record<string, string> = {};
    Object.entries(filtres).forEach(([cle, valeur]) => {
      if (valeur !== undefined && valeur !== null && valeur !== '') {
        params[cle] = String(valeur);
      }
    });
    return this.http.get<CandidateProfile[]>(`${this.base}/public`, { params });
  }

  obtenir(id: string): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.base}/${id}`);
  }

  monProfil(): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.base}/me`);
  }

  modifierMonProfil(formData: FormData): Observable<CandidateProfile> {
    return this.http.put<CandidateProfile>(`${this.base}/me`, formData);
  }

  changerStatut(id: string, statut: StatutCandidate): Observable<CandidateProfile> {
    return this.http.patch<CandidateProfile>(`${this.base}/${id}/statut`, { statut });
  }

  exporterPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/export-pdf`, { responseType: 'blob' });
  }

  obtenirPieceIdentite(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/piece-identite`, { responseType: 'blob' });
  }

  ajouterPieceIdentite(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pieceIdentite', file);
    return this.http.patch(`${this.base}/${id}/piece-identite`, formData);
  }

  // NOUVEAU : Service pour envoyer un signalement
  signalerCandidate(id: string, payload: { motif: string; emailSignaleur?: string; signaleurId?: string }): Observable<any> {
    return this.http.post(`${this.base}/${id}/signaler`, payload);
  }

  // NOUVEAU : Récupérer tous les signalements avec détails (Réservé à l'Admin)
  listerSignalementsAdmin(): Observable<any> {
    return this.http.get(`${this.base}/admin/signalements`);
  }
}