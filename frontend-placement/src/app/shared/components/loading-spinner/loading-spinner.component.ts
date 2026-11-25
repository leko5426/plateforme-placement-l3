import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="text-center py-5">
      <div class="spinner" role="status">
        <span class="visually-hidden">Chargement…</span>
      </div>
      @if (message) {
        <p class="text-muted mt-3 mb-0">{{ message }}</p>
      }
    </div>
  `,
  styles: [
    `
      .spinner {
        width: 42px;
        height: 42px;
        border: 4px solid var(--brand-teal-100);
        border-top-color: var(--brand-teal-700);
        border-radius: 50%;
        margin: 0 auto;
        animation: tourner 0.7s linear infinite;
      }
      @keyframes tourner { to { transform: rotate(360deg); } }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
}
