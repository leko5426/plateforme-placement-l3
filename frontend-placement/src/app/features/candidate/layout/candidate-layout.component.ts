import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-candidate-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  templateUrl: './candidate-layout.component.html',
  styleUrl: './candidate-layout.component.scss',
})
export class CandidateLayoutComponent {
  codeVerification = '';
  enCoursDeVerification = signal(false);

  liens = [
    { lien: 'profil', icone: 'bi-person', libelle: 'Mon profil' },
    { lien: 'messages', icone: 'bi-chat-dots', libelle: 'Messagerie' },
  ];

  constructor(
    public auth: AuthService,
    private notification: NotificationService
  ) {}

  validerLeCode() {
    if (this.codeVerification.length !== 4) return;
    
    this.enCoursDeVerification.set(true);
    
    this.auth.verifyEmail(this.codeVerification).subscribe({
      next: (res) => {
        this.enCoursDeVerification.set(false);
        this.notification.succes(res.message);
      },
      error: (err) => {
        this.enCoursDeVerification.set(false);
        this.notification.erreur(err.error?.message || "Erreur lors de la vérification");
      }
    });
  }
}