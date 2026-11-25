import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1080;">
      @for (toast of notification.toasts(); track toast.id) {
        <div class="toast-card" [class]="'toast-card--' + toast.type" role="alert">
          <i class="bi" [class.bi-check-circle-fill]="toast.type === 'succes'"
             [class.bi-x-circle-fill]="toast.type === 'erreur'"
             [class.bi-info-circle-fill]="toast.type === 'info'"></i>
          <span>{{ toast.message }}</span>
          <button type="button" class="btn-close-mini" (click)="notification.retirer(toast.id)" aria-label="Fermer">
            <i class="bi bi-x"></i>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  constructor(public notification: NotificationService) {}
}
