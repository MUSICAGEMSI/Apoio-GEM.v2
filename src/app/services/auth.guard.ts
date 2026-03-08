// =============================================
// Auth Guards - Route protection
// =============================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

export const masterGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.userRole();
  if (role === 'master' || role === 'dev') return true;
  return router.createUrlTree(['/']);
};

export const devGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.userRole() === 'dev') return true;
  return router.createUrlTree(['/']);
};
