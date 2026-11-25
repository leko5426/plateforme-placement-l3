import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card">
      <div class="stat-icon"><i class="bi" [class]="icon"></i></div>
      <div>
        <p class="stat-valeur text-mono">{{ valeur }}</p>
        <p class="stat-label">{{ label }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: var(--brand-white);
        border: 1px solid var(--brand-sand-dark);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-card);
        padding: 1.25rem 1.5rem;
        height: 100%;
      }
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: var(--brand-teal-100);
        color: var(--brand-teal-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        flex-shrink: 0;
      }
      .stat-valeur {
        font-size: 1.6rem;
        font-weight: 700;
        margin: 0;
        color: var(--brand-ink);
      }
      .stat-label {
        margin: 0;
        color: var(--brand-ink-soft);
        font-size: 0.85rem;
        font-weight: 500;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() icon = 'bi-graph-up';
  @Input() valeur: string | number = 0;
  @Input() label = '';
}
