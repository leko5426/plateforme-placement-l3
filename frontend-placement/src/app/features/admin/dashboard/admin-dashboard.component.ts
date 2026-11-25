import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { StatistiquesAdmin } from '../../../core/models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [StatCardComponent, LoadingSpinnerComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<StatistiquesAdmin | null>(null);
  chargement = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.obtenirStatistiques().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  totalCandidatesParStatut(statut: string): number {
    return this.stats()?.candidatesParStatut.find((s) => s._id === statut)?.total ?? 0;
  }

  totalVisitesParCategorie(categorie: string): number {
    return this.stats()?.visitesParCategorie.find((v) => v._id === categorie)?.total ?? 0;
  }
}
