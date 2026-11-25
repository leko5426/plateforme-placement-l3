import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-annonce-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annonce-create.component.html',
  styleUrl: './annonce-create.component.scss',
})
export class AnnonceCreateComponent {
  enEnvoi = signal(false);
  envoye = signal(false);
  agentSlug = '';
  candidateId = ''; 

  modele = {
    nomEmployeur: '',
    entreprise: '',
    emailEmployeur: '',
    telephoneEmployeur: '',
    titre: '',
    description: '',
    localisation: '',
    ageMin: 18,
    ageMax: 60,
    experienceMin: 0,
  };

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.agentSlug = this.route.snapshot.queryParamMap.get('agent') || '';
    this.candidateId = this.route.snapshot.queryParamMap.get('candidateId') || ''; 
  }

  soumettre(form: NgForm) {
    if (form.invalid) {
      this.notification.erreur('Merci de compléter tous les champs obligatoires.');
      return;
    }

    this.enEnvoi.set(true);

    // Formatage des données pour correspondre EXACTEMENT à ce qu'attend le backend (AnnonceController)
    const payload = {
      nomEmployeur: this.modele.nomEmployeur,
      entreprise: this.modele.entreprise,
      emailEmployeur: this.modele.emailEmployeur,
      telephoneEmployeur: this.modele.telephoneEmployeur,
      titre: this.modele.titre,
      description: this.modele.description,
      localisation: this.modele.localisation,
      criteres: {
        ageMin: this.modele.ageMin,
        ageMax: this.modele.ageMax,
        experienceMin: this.modele.experienceMin,
      },
      agentSlug: this.agentSlug || undefined,
      candidateCible: this.candidateId || undefined,
    };

    // Modification de la route : on pointe vers /api/annonces
    this.http.post('http://localhost:5000/api/annonces', payload).subscribe({
      next: () => {
        this.envoye.set(true);
        this.enEnvoi.set(false);
      },
      error: (err) => {
        this.enEnvoi.set(false);
        console.error(err);
        this.notification.erreur("Erreur lors de l'envoi de la demande.");
      },
    });
  }

  retourAccueil() {
    this.router.navigate(['/']);
  }
}