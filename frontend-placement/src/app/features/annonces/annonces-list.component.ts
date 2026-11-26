import { environment } from '../../../environments/environment';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AnnonceService } from '../../core/services/annonce.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Annonce } from '../../core/models';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StarBadgeComponent } from '../../shared/components/star-badge/star-badge.component';

@Component({
  selector: 'app-annonces-list',
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent, EmptyStateComponent, StarBadgeComponent, RouterModule],
  templateUrl: './annonces-list.component.html',
})
export class AnnoncesListComponent implements OnInit {
  annonces = signal<Annonce[]>([]);
  chargement = signal(true);
  accesRefuse = signal(false);
  filtreActif = signal('nouvelle');
  enCours = signal<string | null>(null);

  apiUrl = environment.socketUrl;

  constructor(
    private annonceService: AnnonceService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement.set(true);
    this.accesRefuse.set(false);
    this.annonceService.lister(this.filtreActif() || undefined).subscribe({
      next: (liste) => {
        this.annonces.set(liste);
        this.chargement.set(false);
      },
      error: (erreur: HttpErrorResponse) => {
        if (erreur.status === 403) this.accesRefuse.set(true);
        this.chargement.set(false);
      },
    });
  }

  filtrer(statut: string) {
    this.filtreActif.set(statut);
    this.charger();
  }

  nomAgence(a: Annonce): string | null {
    const agent = a.agentDestinataire;
    return agent && typeof agent === 'object' ? (agent as any).nomAgence : null;
  }

  peutCloturer(a: Annonce): boolean {
    if (a.statut === 'cloturee') return false;
    return this.auth.aLeRole('admin') || a.statut === 'en_traitement';
  }

  prendreEnCharge(a: Annonce) {
    this.changerStatut(a, 'en_traitement', 'Demande prise en charge.');
  }

  async cloturer(a: Annonce) {
    const confirme = await this.confirmDialog.demander(
      `Clôturer la demande « ${a.titre} » ? Elle ne pourra plus être modifiée.`,
      'Clôturer la demande',
      'Clôturer'
    );
    if (!confirme) return;
    this.changerStatut(a, 'cloturee', 'Demande clôturée.');
  }

  private changerStatut(a: Annonce, statut: 'en_traitement' | 'cloturee', messageSucces: string) {
    this.enCours.set(a._id);
    this.annonceService.modifier(a._id, { statut }).subscribe({
      next: () => {
        this.enCours.set(null);
        this.notification.succes(messageSucces);
        this.charger();
      },
      error: () => {
        this.enCours.set(null);
        this.charger();
      },
    });
  }
}