import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-agent.component.html',
  styleUrl: './register-agent.component.scss',
})
export class RegisterAgentComponent {
  enEnvoi = signal(false);
  inscrit = signal(false);

  modele = {
    nom: '',
    email: '',
    password: '',
    telephone: '',
    nomAgence: '',
    localisation: '',
    description: '',
  };

  constructor(private auth: AuthService, private router: Router, private notification: NotificationService) {}

  soumettre(form: NgForm) {
    if (form.invalid) return;

    this.enEnvoi.set(true);
    this.auth.registerAgent(this.modele).subscribe({
      next: () => {
        this.enEnvoi.set(false);
        this.inscrit.set(true);
      },
      error: () => this.enEnvoi.set(false),
    });
  }

  allerConnexion() {
    this.router.navigate(['/connexion']);
  }
}
