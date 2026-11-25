import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { CandidateProfile, StatutCandidate, User } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarBadgeComponent } from '../../../shared/components/star-badge/star-badge.component';

@Component({
  selector: 'app-agent-candidates-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StarBadgeComponent],
  templateUrl: './agent-candidates-list.component.html',
  styleUrl: './agent-candidates-list.component.scss',
})
export class AgentCandidatesListComponent implements OnInit {
  candidates = signal<CandidateProfile[]>([]);
  chargement = signal(true);
  filtreActif = signal<string>('');

  constructor(
    private agentService: AgentService,
    private candidateService: CandidateService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement.set(true);
    this.agentService.mesCandidates(this.filtreActif() || undefined).subscribe({
      next: (c: any) => {
        const data = c && c.data ? c.data : c;
        this.candidates.set(data);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  filtrer(statut: string) {
    this.filtreActif.set(statut);
    this.charger();
  }

  nomUtilisateur(c: CandidateProfile): string {
    return typeof c.user === 'object' ? (c.user as User).nom : '';
  }

  changerStatut(c: CandidateProfile, statut: StatutCandidate) {
    this.candidateService.changerStatut(c._id, statut).subscribe({
      next: (maj: any) => {
        const majData = maj && maj.data ? maj.data : maj;
        this.candidates.update((liste) => liste.map((x) => (x._id === majData._id ? majData : x)));
        this.notification.succes('Statut mis à jour.');
      },
    });
  }
}