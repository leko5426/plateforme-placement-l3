import { environment } from '../../../../environments/environment';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CandidateService, FiltresCandidate } from '../../../core/services/candidate.service';
import { CandidateProfile, User } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-candidate-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './candidate-search.component.html',
  styleUrl: './candidate-search.component.scss'
})
export class CandidateSearchComponent implements OnInit {
  baseUrl = environment.socketUrl;
  candidates = signal<CandidateProfile[]>([]);
  chargement = signal(true);

  filtres: FiltresCandidate = {
    ville: '',
    disponibilite: '',
    experienceMin: undefined
  };

  constructor(private candidateService: CandidateService) {}

  ngOnInit() {
    this.rechercher();
  }

  rechercher() {
    this.chargement.set(true);
    this.candidateService.rechercher(this.filtres).subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : res;
        this.candidates.set(data);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false)
    });
  }

  reinitialiser() {
    this.filtres = { ville: '', disponibilite: '', experienceMin: undefined };
    this.rechercher();
  }

  nomUtilisateur(c: CandidateProfile): string {
    return typeof c.user === 'object' ? (c.user as User).nom : 'Candidate';
  }
  
  formaterDispo(dispo: string): string {
    if (!dispo) return '';
    return dispo.replace('_', ' ');
  }
}