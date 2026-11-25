import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';
import { AgentProfile } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.scss',
})
export class AgentProfileComponent implements OnInit {
  agent = signal<AgentProfile | null>(null);
  chargement = signal(true);
  introuvable = signal(false);

  constructor(private route: ActivatedRoute, private agentService: AgentService) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.agentService.obtenirParSlug(slug).subscribe({
      next: (agent) => {
        this.agent.set(agent);
        this.chargement.set(false);
      },
      error: () => {
        this.introuvable.set(true);
        this.chargement.set(false);
      },
    });
  }
}
