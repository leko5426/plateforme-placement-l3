import { environment } from '../../../../environments/environment';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CandidatureService } from '../../../core/services/candidature.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-agent-candidatures-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './agent-candidatures-list.component.html',
  styleUrl: './agent-candidatures-list.component.scss',
})
export class AgentCandidaturesListComponent implements OnInit {
  candidatures = signal<any[]>([]);
  chargement = signal(true);
  apiUrl = environment.socketUrl; 

  constructor(
    private candidatureService: CandidatureService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.chargerCandidatesIndependantes();
  }

  chargerCandidatesIndependantes() {
    this.chargement.set(true);
    this.candidatures.set([]); // Initialisation propre
    this.candidatureService.listerCandidaturesSpontanees().subscribe({
      next: (res: any) => { 
        const data = res && res.data ? res.data : res;
        this.candidatures.set(Array.isArray(data) ? data : []);
        this.chargement.set(false);
      },
      error: (err) => {
        console.error("Erreur chargement", err);
        this.chargement.set(false);
      },
    });
  }

  async recruter(candidate: any) {
    const nom = candidate.user?.nom || 'cette candidate';
    const confirme = await this.confirmDialog.demander(
      `Veux-tu vraiment recruter ${nom} et l'intégrer à ton agence ?`,
      'Confirmer le recrutement',
      'Intégrer à mon agence'
    );
    
    if (!confirme) return;

    this.candidatureService.integrerCandidate(candidate._id).subscribe({
      next: () => { 
        this.candidatures.update(liste => liste.filter(c => c._id !== candidate._id));
        this.notification.succes(`${nom} a été intégrée à ton agence avec succès !`);
      },
      error: () => {
        this.notification.erreur("Erreur lors de l'intégration.");
      }
    });
  }
}