import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AgentService } from '../../../core/services/agent.service';
import { AgentProfile } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-agent-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './agent-profile-edit.component.html',
  styleUrl: './agent-profile-edit.component.scss',
})
export class AgentProfileEditComponent implements OnInit {
  chargement = signal(true);
  enEnvoi = signal(false);
  apercuLogo = signal<string | null>(null);
  fichierLogo: File | null = null;

  modele = { nomAgence: '', localisation: '', description: '' };
  agent: AgentProfile | null = null;

  constructor(private agentService: AgentService, private notification: NotificationService) {}

  ngOnInit() {
    this.agentService.monProfil().subscribe({
      next: (a) => {
        this.agent = a;
        this.modele = { nomAgence: a.nomAgence, localisation: a.localisation, description: a.description || '' };
        this.apercuLogo.set(a.logo || null);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  surChangementLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;

    this.fichierLogo = fichier;
    const lecteur = new FileReader();
    lecteur.onload = () => this.apercuLogo.set(lecteur.result as string);
    lecteur.readAsDataURL(fichier);
  }

  soumettre(form: NgForm) {
    if (form.invalid) return;

    const formData = new FormData();
    formData.append('nomAgence', this.modele.nomAgence);
    formData.append('localisation', this.modele.localisation);
    formData.append('description', this.modele.description);
    if (this.fichierLogo) formData.append('logo', this.fichierLogo);

    this.enEnvoi.set(true);
    this.agentService.modifierMonProfil(formData).subscribe({
      next: (a) => {
        this.agent = a;
        this.enEnvoi.set(false);
        this.notification.succes('Profil mis à jour avec succès.');
      },
      error: () => this.enEnvoi.set(false),
    });
  }
}
