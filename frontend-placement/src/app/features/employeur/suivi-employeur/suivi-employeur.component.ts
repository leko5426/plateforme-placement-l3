import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-suivi-employeur',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './suivi-employeur.component.html'
})
export class SuiviEmployeurComponent implements OnInit {
  demandes = signal<any[]>([]);
  chargement = signal(true);
  messageErreur = signal<string | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tokenUrl = params['token'];
      if (tokenUrl) {
        localStorage.setItem('token', tokenUrl);
        this.router.navigate([], { queryParams: { token: null }, queryParamsHandling: 'merge' });
      }
      this.chargerDemandes();
    });
  }

  chargerDemandes() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.chargement.set(false);
      this.messageErreur.set("Accès refusé. Aucun lien de connexion valide trouvé.");
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // NOUVEAU : On interroge l'API des annonces, pas des demandes
    this.http.get<any[]>('http://localhost:5000/api/annonces/mes-annonces', { headers }).subscribe({
      next: (data) => {
        this.demandes.set(data);
        this.chargement.set(false);
      },
      error: () => {
        this.chargement.set(false);
        this.messageErreur.set("Votre lien a expiré ou est invalide. Veuillez publier une nouvelle demande.");
        localStorage.removeItem('token');
      }
    });
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'nouvelle': return 'bg-warning text-dark';
      case 'en_traitement': return 'bg-info text-dark';
      case 'cloturee': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}