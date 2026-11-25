import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CandidateProfile, StatutCandidate, User } from '../../../core/models';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarBadgeComponent } from '../../../shared/components/star-badge/star-badge.component';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    LoadingSpinnerComponent, 
    EmptyStateComponent, 
    StarBadgeComponent
  ],
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss'
})
export class CandidateDetailComponent implements OnInit {
  candidate = signal<CandidateProfile | null>(null);
  chargement = signal(true);
  introuvable = signal(false);
  
  fichierPiece: File | null = null;
  enTelechargement = signal(false);
  
  afficherSignalement = signal(false);
  motifSignalement = '';
  emailSignaleur = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidateService: CandidateService,
    public auth: AuthService,
    private notification: NotificationService 
  ) {}

  ngOnInit() {
    this.chargerProfil();
  }

  chargerProfil() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.introuvable.set(true);
      this.chargement.set(false);
      return;
    }

    this.chargement.set(true);
    this.candidateService.obtenir(id).subscribe({
      next: (res: any) => {
        this.candidate.set(res.data ? res.data : res);
        this.chargement.set(false);
      },
      error: () => {
        this.introuvable.set(true);
        this.chargement.set(false);
      }
    });
  }

  nomUtilisateur(): string {
    const c = this.candidate();
    if (!c || !c.user) return 'Candidate';
    return typeof c.user === 'object' ? (c.user as User).nom : 'Candidate';
  }

  peutFaireDemande(): boolean {
    return !this.auth.aLeRole('agent', 'admin');
  }

  faireDemande() {
    const c = this.candidate();
    if (!c || !c._id) return;
    this.router.navigate(['/annonce/nouvelle'], { queryParams: { candidateId: c._id } });
  }

  peutContacter(): boolean {
    return this.auth.estConnecte() && !this.auth.aLeRole('candidate');
  }

  contacter() {
    const c = this.candidate();
    const cibleUser = c?.user;
    const userId = typeof cibleUser === 'object' ? (cibleUser as any)._id : cibleUser;

    if (!userId) {
      this.notification.erreur('Impossible de contacter cette candidate. Informations manquantes.');
      return;
    }
    this.router.navigate(['/agent/messages'], { queryParams: { nouveauContact: userId } });
  }

  peutGererStatut(): boolean {
    return this.auth.aLeRole('agent', 'admin');
  }

  changerStatut(statut: string) {
    const c = this.candidate();
    if (!c) return;
    this.candidateService.changerStatut(c._id, statut as StatutCandidate).subscribe({
      next: (res: any) => {
        this.candidate.set(res.data ? res.data : res);
      }
    });
  }

  exporterPDF() {
    const c = this.candidate();
    if (!c) return;
    this.candidateService.exporterPDF(c._id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  voirPieceIdentite() {
    const c = this.candidate();
    if (!c) return;
    this.candidateService.obtenirPieceIdentite(c._id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  onFichierSelectionne(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fichierPiece = input.files[0];
    }
  }

  uploaderPiece() {
    const c = this.candidate();
    if (!c || !this.fichierPiece) return;
    
    this.enTelechargement.set(true);
    this.candidateService.ajouterPieceIdentite(c._id, this.fichierPiece).subscribe({
      next: (res: any) => {
        this.candidate.set(res.data ? res.data : res);
        this.fichierPiece = null;
        this.enTelechargement.set(false);
      },
      error: () => {
        this.enTelechargement.set(false);
      }
    });
  }

  // ==========================================
  // NOUVEAU : GESTION DU SIGNALEMENT
  // ==========================================

  envoyerSignalement() {
    if (!this.motifSignalement.trim()) {
      this.notification.erreur('Veuillez décrire le problème avant de signaler.');
      return;
    }

    const c = this.candidate();
    if (!c) return;

    // Récupération de l'ID du signaleur connecté s'il y en a un
    const signaleurId = this.auth.utilisateur()?._id;

    const payload = {
      motif: this.motifSignalement,
      emailSignaleur: this.emailSignaleur,
      signaleurId: signaleurId
    };

    this.candidateService.signalerCandidate(c._id, payload).subscribe({
      next: (res: any) => {
        this.notification.succes(res.message || 'Profil signalé avec succès.');
        this.afficherSignalement.set(false);
        this.motifSignalement = ''; 
        this.emailSignaleur = '';   
      },
      error: (err) => {
        this.notification.erreur(err.error?.message || "Erreur lors de l'envoi du signalement.");
      }
    });
  }
}