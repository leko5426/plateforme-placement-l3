import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AgentProfile, User } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarBadgeComponent } from '../../../shared/components/star-badge/star-badge.component';

@Component({
  selector: 'app-admin-agents-validation',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, StarBadgeComponent],
  templateUrl: './admin-agents-validation.component.html',
  styleUrl: './admin-agents-validation.component.scss',
})
export class AdminAgentsValidationComponent implements OnInit {
  agents = signal<AgentProfile[]>([]);
  chargement = signal(true);
  filtreActif = signal('en_attente');

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement.set(true);
    this.adminService.listerAgents(this.filtreActif() || undefined).subscribe({
      next: (a) => {
        this.agents.set(a);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  filtrer(statut: string) {
    this.filtreActif.set(statut);
    this.charger();
  }

  nomUtilisateur(agent: AgentProfile): string {
    return typeof agent.user === 'object' ? (agent.user as User).nom : '';
  }

  emailUtilisateur(agent: AgentProfile): string {
    return typeof agent.user === 'object' ? (agent.user as User).email : '';
  }

  async valider(agent: AgentProfile, statutValidation: 'valide' | 'rejete') {
    const libelle = statutValidation === 'valide' ? 'valider' : 'rejeter';
    const confirme = await this.confirmDialog.demander(
      `Confirmer ${libelle} l'agence "${agent.nomAgence}" ? Un email lui sera envoyé.`,
      'Validation d\'agence',
      statutValidation === 'valide' ? 'Valider' : 'Rejeter'
    );
    if (!confirme) return;

    this.adminService.validerAgent(agent._id, statutValidation).subscribe({
      next: () => {
        this.notification.succes('Statut mis à jour.');
        this.charger();
      },
    });
  }
}
