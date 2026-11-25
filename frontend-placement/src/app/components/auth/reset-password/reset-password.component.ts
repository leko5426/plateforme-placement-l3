import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Ajuste le chemin selon ton projet

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h3 class="card-title text-center mb-4">Nouveau mot de passe</h3>
              
              <div *ngIf="messageSuccess" class="alert alert-success">
                {{ messageSuccess }}
                <div class="mt-2">
                  <a routerLink="/connexion" class="btn btn-sm btn-outline-success">Aller à la connexion</a>
                </div>
              </div>
              
              <div *ngIf="messageError" class="alert alert-danger">
                {{ messageError }}
              </div>

              <form (ngSubmit)="onSubmit()" *ngIf="!messageSuccess">
                <div class="mb-3">
                  <label for="password" class="form-label">Nouveau mot de passe</label>
                  <input type="password" class="form-control" id="password" [(ngModel)]="password" name="password" required minlength="6">
                </div>
                
                <div class="mb-4">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
                  <input type="password" class="form-control" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" required>
                  <div *ngIf="password && confirmPassword && password !== confirmPassword" class="text-danger small mt-1">
                    Les mots de passe ne correspondent pas.
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="isLoading || !password || password !== confirmPassword">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Enregistrer le mot de passe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token: string = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  messageSuccess = '';
  messageError = '';

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.messageError = "Le lien est invalide (jeton manquant).";
    }
  }

  onSubmit() {
    if (!this.password || this.password !== this.confirmPassword || !this.token) return;

    this.isLoading = true;
    this.messageError = '';

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.messageSuccess = res.message;
        this.isLoading = false;
        // Optionnel : Rediriger automatiquement après 3 secondes
        setTimeout(() => this.router.navigate(['/connexion']), 3000);
      },
      error: (err) => {
        this.messageError = err.error?.message || "Erreur lors de la réinitialisation.";
        this.isLoading = false;
      }
    });
  }
}