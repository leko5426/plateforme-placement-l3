import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';
import { AgentProfile } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './agent-list.component.html',
  styleUrl: './agent-list.component.scss',
})
export class AgentListComponent implements OnInit {
  agents = signal<AgentProfile[]>([]);
  chargement = signal(true);
  localisation = '';

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.rechercher();
  }

  rechercher() {
    this.chargement.set(true);
    this.agentService.lister(this.localisation || undefined).subscribe({
      next: (agents) => {
        this.agents.set(agents);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }
}
