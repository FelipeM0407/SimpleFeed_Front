import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  if (token) {
    return true; // Permite o acesso
  }
  return router.parseUrl('/login'); // Redireciona para a tela de login
};
