import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';
import { DashboardAgent } from '../../../core/models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [RouterLink, StatCardComponent, LoadingSpinnerComponent],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss',
})
export class AgentDashboardComponent implements OnInit {
  dashboard = signal<DashboardAgent | null>(null);
  chargement = signal(true);

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.agentService.monDashboard().subscribe({
      next: (d) => {
        this.dashboard.set(d);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  totalParStatut(statut: string): number {
    return this.dashboard()?.candidatesParStatut.find((s) => s._id === statut)?.total ?? 0;
  }
}
