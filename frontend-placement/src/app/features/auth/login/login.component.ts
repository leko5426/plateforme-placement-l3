import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  enEnvoi = signal(false);

  constructor(private auth: AuthService, private router: Router, private notification: NotificationService) {}

  soumettre(form: NgForm) {
    if (form.invalid) return;

    this.enEnvoi.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: (reponse) => {
        this.enEnvoi.set(false);
        this.notification.succes(`Bienvenue, ${reponse.nom} !`);
        if (reponse.role === 'admin') this.router.navigate(['/admin']);
        else if (reponse.role === 'agent') this.router.navigate(['/agent']);
        else if (reponse.role === 'candidate') this.router.navigate(['/candidate']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.enEnvoi.set(false);
        // Affiche l'erreur spécifique du backend ("Email ou mot de passe incorrect")
        this.notification.erreur(err.error?.message || 'Identifiants incorrects.');
      },
    });
  }
}