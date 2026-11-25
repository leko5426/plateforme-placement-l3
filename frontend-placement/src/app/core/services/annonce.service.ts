import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Annonce } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {
  private base = `${environment.apiUrl}/annonces`; // Vérifie que cette URL correspond à ta config

  constructor(private http: HttpClient) {}

  lister(statut?: string): Observable<Annonce[]> {
    const params: any = {};
    if (statut) {
      params.statut = statut;
    }
    return this.http.get<Annonce[]>(this.base, { params });
  }

  // LA MÉTHODE MISE À JOUR :
  creer(donnees: {
    nomEmployeur: string;
    entreprise?: string;
    emailEmployeur: string;
    telephoneEmployeur?: string;
    titre: string;
    description: string;
    localisation: string;
    criteres?: {
      ageMin?: number;
      ageMax?: number;
      experienceMin?: number;
    };
    agentSlug?: string;
    candidateCible?: string; // <-- Le champ ajouté est ici !
  }): Observable<Annonce> {
    return this.http.post<Annonce>(this.base, donnees);
  }

  modifier(id: string, donnees: Partial<Annonce>): Observable<Annonce> {
    return this.http.patch<Annonce>(`${this.base}/${id}`, donnees);
  }
} 