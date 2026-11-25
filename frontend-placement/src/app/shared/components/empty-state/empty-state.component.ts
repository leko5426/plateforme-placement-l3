import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <i class="bi" [class]="icon"></i>
      <h5>{{ titre }}</h5>
      <p class="text-muted mb-0">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 3rem 1.5rem;
        color: var(--brand-ink-soft);
      }
      .empty-state i {
        font-size: 2.2rem;
        color: var(--brand-teal-600);
        margin-bottom: 0.75rem;
        display: block;
      }
      .empty-state h5 {
        font-family: var(--font-display);
        margin-bottom: 0.35rem;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() titre = 'Rien à afficher pour le moment';
  @Input() description = '';
}
