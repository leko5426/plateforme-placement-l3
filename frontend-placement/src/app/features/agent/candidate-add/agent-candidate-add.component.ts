import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-agent-candidate-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-candidate-add.component.html',
  styleUrl: './agent-candidate-add.component.scss',
})
export class AgentCandidateAddComponent {
  enEnvoi = signal(false);
  apercuPhoto = signal<string | null>(null);
  fichierPhoto: File | null = null;

  modele = {
    nom: '',
    email: '',
    password: '',
    telephone: '',
    ville: '',
    age: 25,
    experienceAnnees: 0,
    disponibilite: 'temps_plein',
    description: '',
    competencesTexte: '',
  };

  constructor(private agentService: AgentService, private notification: NotificationService, private router: Router) {}

  surChangementPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;

    this.fichierPhoto = fichier;
    const lecteur = new FileReader();
    lecteur.onload = () => this.apercuPhoto.set(lecteur.result as string);
    lecteur.readAsDataURL(fichier);
  }

  soumettre(form: NgForm) {
    if (form.invalid) return;

    const formData = new FormData();
    formData.append('nom', this.modele.nom);
    formData.append('email', this.modele.email);
    formData.append('password', this.modele.password);
    formData.append('telephone', this.modele.telephone);
    formData.append('ville', this.modele.ville);
    formData.append('age', String(this.modele.age));
    formData.append('experienceAnnees', String(this.modele.experienceAnnees));
    formData.append('disponibilite', this.modele.disponibilite);
    formData.append('description', this.modele.description);

    this.modele.competencesTexte
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => formData.append('competences[]', c));

    if (this.fichierPhoto) formData.append('photo', this.fichierPhoto);

    this.enEnvoi.set(true);
    this.agentService.ajouterCandidate(formData).subscribe({
      next: () => {
        this.enEnvoi.set(false);
        this.notification.succes('Candidate ajoutée à votre portefeuille.');
        this.router.navigate(['/agent/candidates']);
      },
      error: () => this.enEnvoi.set(false),
    });
  }
}
