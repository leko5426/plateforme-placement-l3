import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Ajuste le chemin selon ton projet

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h3 class="card-title text-center mb-4">Mot de passe oublié</h3>
              
              <div *ngIf="messageSuccess" class="alert alert-success">
                {{ messageSuccess }}
              </div>
              <div *ngIf="messageError" class="alert alert-danger">
                {{ messageError }}
              </div>

              <form (ngSubmit)="onSubmit()" *ngIf="!messageSuccess">
                <div class="mb-3">
                  <label for="email" class="form-label">Adresse e-mail</label>
                  <input type="email" class="form-control" id="email" [(ngModel)]="email" name="email" required>
                  <div class="form-text">Entrez l'adresse e-mail associée à votre compte.</div>
                </div>

                <button type="submit" class="btn btn-primary w-100 mb-3" [disabled]="isLoading || !email">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Envoyer le lien de réinitialisation
                </button>
              </form>
              
              <div class="text-center mt-3">
                <a routerLink="/connexion" class="text-decoration-none">Retour à la connexion</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  
  email: string = '';
  isLoading = false;
  messageSuccess = '';
  messageError = '';

  onSubmit() {
    if (!this.email) return;
    
    this.isLoading = true;
    this.messageError = '';
    this.messageSuccess = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.messageSuccess = res.message;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageError = err.error?.message || "Une erreur est survenue.";
        this.isLoading = false;
      }
    });
  }
}