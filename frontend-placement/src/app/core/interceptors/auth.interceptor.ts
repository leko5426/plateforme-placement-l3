import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // On n'envoie pas le token si on essaie de se connecter ou s'inscrire
  const estUneRouteAuth = req.url.includes('/login') || req.url.includes('/register');

  if (token && !estUneRouteAuth) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};