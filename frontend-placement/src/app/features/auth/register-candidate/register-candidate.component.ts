import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

const TAILLE_MAX_FICHIER = 5 * 1024 * 1024; // 5 Mo
const EXTENSIONS_IDENTITE = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

@Component({
  selector: 'app-register-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-candidate.component.html',
  styleUrl: './register-candidate.component.scss',
})
export class RegisterCandidateComponent {
  enEnvoi = signal(false);
  agentSlug = '';
  apercuPhoto = signal<string | null>(null);
  fichierPhoto: File | null = null;

  fichierIdentite: File | null = null;
  nomFichierIdentite = signal('');
  erreurIdentite = signal('');
  consentement = false;

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {
    this.agentSlug = this.route.snapshot.queryParamMap.get('agent') || '';
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

  surChangementIdentite(event: Event) {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];

    this.fichierIdentite = null;
    this.nomFichierIdentite.set('');
    this.erreurIdentite.set('');
    if (!fichier) return;

    const extension = fichier.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONS_IDENTITE.includes(extension)) {
      this.erreurIdentite.set('Format non accepté : utilise JPG, PNG, WEBP ou PDF.');
      input.value = '';
      return;
    }
    if (fichier.size > TAILLE_MAX_FICHIER) {
      this.erreurIdentite.set('Fichier trop volumineux (5 Mo maximum).');
      input.value = '';
      return;
    }

    this.fichierIdentite = fichier;
    this.nomFichierIdentite.set(fichier.name);
  }

  soumettre(form: NgForm) {
    if (!this.fichierIdentite && !this.erreurIdentite()) {
      this.erreurIdentite.set("La pièce d'identité est obligatoire.");
    }

    if (form.invalid || !this.fichierIdentite) {
      this.notification.erreur('Merci de compléter tous les champs obligatoires.');
      return;
    }

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

    if (this.agentSlug) formData.append('agentSlug', this.agentSlug);
    if (this.fichierPhoto) formData.append('photo', this.fichierPhoto);
    formData.append('pieceIdentite', this.fichierIdentite);

    this.enEnvoi.set(true);
    this.auth.registerCandidate(formData).subscribe({
      next: () => {
        this.enEnvoi.set(false);
        this.notification.succes('Ton profil a été créé avec succès !');
        this.router.navigate(['/candidate/profil']);
      },
      error: () => this.enEnvoi.set(false),
    });
  }
}