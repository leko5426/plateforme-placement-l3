import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((erreur: HttpErrorResponse) => {
      const estUneRouteAuth = req.url.includes('/login') || req.url.includes('/register');
      const message = erreur.error?.message || 'Une erreur est survenue. Réessaie dans un instant.';

      // On laisse la page de login afficher sa propre erreur
      if (estUneRouteAuth && (erreur.status === 401 || erreur.status === 400 || erreur.status === 404)) {
        return throwError(() => erreur);
      }

      if (erreur.status === 401) {
        auth.logout();
        notification.erreur('Ta session a expiré, reconnecte-toi.');
        router.navigate(['/connexion']);
      } else if (erreur.status === 403) {
        notification.erreur("Tu n'as pas accès à cette action.");
      } else if (erreur.status === 0) {
        notification.erreur('Impossible de joindre le serveur. Vérifie ta connexion.');
      } else {
        notification.erreur(message);
      }

      return throwError(() => erreur);
    })
  );
};