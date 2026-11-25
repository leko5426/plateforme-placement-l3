import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Role } from '../models';

export const roleGuard = (rolesAutorises: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);

    if (!auth.estConnecte()) {
      router.navigate(['/connexion']);
      return false;
    }

    if (auth.aLeRole(...rolesAutorises)) return true;

    notification.erreur("Tu n'as pas accès à cet espace.");
    router.navigate(['/']);
    return false;
  };
};
