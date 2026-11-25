import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SignalementService } from '../../../core/services/signalement.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { User } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarBadgeComponent } from '../../../shared/components/star-badge/star-badge.component';

@Component({
  selector: 'app-admin-signalements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StarBadgeComponent],
  templateUrl: './admin-signalements.component.html',
  styleUrl: './admin-signalements.component.scss',
})
export class AdminSignalementsComponent implements OnInit {
  signalements = signal<any[]>([]);
  tousLesSignalements: any[] = [];
  chargement = signal(true);
  filtreActif = signal('en_attente');
  commentaires: Record<string, string> = {};

  constructor(
    private signalementService: SignalementService, 
    private candidateService: CandidateService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement.set(true);
    this.candidateService.listerSignalementsAdmin().subscribe({
      next: (res: any) => {
        this.tousLesSignalements = res.data ? res.data : res;
        this.appliquerFiltre();
        this.chargement.set(false);
      },
      error: () => {
        this.notification.erreur('Erreur lors du chargement des signalements.');
        this.chargement.set(false);
      },
    });
  }

  filtrer(statut: string) {
    this.filtreActif.set(statut);
    this.appliquerFiltre();
  }

  appliquerFiltre() {
    if (this.filtreActif() === '') {
      this.signalements.set(this.tousLesSignalements);
    } else {
      this.signalements.set(this.tousLesSignalements.filter(s => s.statut === this.filtreActif()));
    }
  }

  signaleurTexte(signalement: any): string {
    if (signalement.signalePar && typeof signalement.signalePar === 'object') {
      return (signalement.signalePar as User).nom;
    }
    return signalement.emailSignaleur || 'Anonyme';
  }

  traiter(signalement: any, statut: 'traite' | 'rejete') {
    const commentaire = this.commentaires[signalement._id] || '';
    this.signalementService.traiter(signalement._id, statut, commentaire).subscribe({
      next: () => {
        this.notification.succes('Signalement mis à jour.');
        this.charger();
      },
      error: () => {
        this.notification.erreur('Erreur lors de la mise à jour.');
      }
    });
  }
}