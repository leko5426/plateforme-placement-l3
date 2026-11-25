import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { CandidateProfile } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StarBadgeComponent } from '../../../shared/components/star-badge/star-badge.component';

@Component({
  selector: 'app-candidate-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, StarBadgeComponent],
  templateUrl: './candidate-profile-edit.component.html',
  styleUrl: './candidate-profile-edit.component.scss',
})
export class CandidateProfileEditComponent implements OnInit {
  chargement = signal(true);
  enEnvoi = signal(false);
  apercuPhoto = signal<string | null>(null);
  fichierPhoto: File | null = null;
  profil: CandidateProfile | null = null;

  modele = {
    ville: '',
    age: 25,
    experienceAnnees: 0,
    disponibilite: 'temps_plein',
    description: '',
    competencesTexte: '',
  };

  constructor(
    private candidateService: CandidateService,
    private notification: NotificationService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.candidateService.monProfil().subscribe({
      next: (p) => {
        this.profil = p;
        this.modele = {
          ville: p.ville,
          age: p.age,
          experienceAnnees: p.experienceAnnees,
          disponibilite: p.disponibilite,
          description: p.description || '',
          competencesTexte: (p.competences || []).join(', '),
        };
        this.apercuPhoto.set(p.photo || null);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

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
    this.candidateService.modifierMonProfil(formData).subscribe({
      next: (p) => {
        this.profil = p;
        this.enEnvoi.set(false);
        this.notification.succes('Profil mis à jour avec succès.');
      },
      error: () => this.enEnvoi.set(false),
    });
  }
}
