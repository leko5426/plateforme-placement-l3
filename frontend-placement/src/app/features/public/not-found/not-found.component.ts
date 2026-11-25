import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <span class="text-mono display-4 text-teal fw-bold">404</span>
      <h2 class="mt-3">Cette page n'existe pas</h2>
      <p class="text-muted">Le lien est peut-être expiré ou mal orthographié.</p>
      <a routerLink="/" class="btn btn-primary mt-2">Retour à l'accueil</a>
    </div>
  `,
})
export class NotFoundComponent {}
