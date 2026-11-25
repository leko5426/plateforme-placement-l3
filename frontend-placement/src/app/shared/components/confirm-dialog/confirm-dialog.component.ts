import { Component } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (service.etat(); as etat) {
      <div class="modal-backdrop-custom">
        <div class="modal-box">
          <h5>{{ etat.titre }}</h5>
          <p class="text-muted">{{ etat.message }}</p>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button class="btn btn-outline-primary btn-sm" (click)="service.repondre(false)">Annuler</button>
            <button class="btn btn-primary btn-sm" (click)="service.repondre(true)">{{ etat.libelleConfirmer }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-backdrop-custom {
        position: fixed;
        inset: 0;
        background: rgba(30, 37, 33, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1090;
      }
      .modal-box {
        background: var(--brand-white);
        border-radius: var(--radius-md);
        padding: 1.75rem;
        max-width: 380px;
        width: 90%;
        box-shadow: var(--shadow-card-hover);
      }
      .modal-box h5 { font-family: var(--font-display); }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(public service: ConfirmDialogService) {}
}
