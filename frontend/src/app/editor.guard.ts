import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Guard for the `/editor` route.
 *
 * Blocks access when no GeneratedResume exists and redirects to `/gerar`
 * with a clear informational message stored in sessionStorage.
 *
 * The `/gerar` component can read the message via:
 *   `sessionStorage.getItem('editorRedirectMessage')`
 */
export const editorGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  const redirectWithMessage = () => {
    sessionStorage.setItem(
      'editorRedirectMessage',
      'Gere um currículo primeiro para acessar o editor.'
    );
    return router.createUrlTree(['/gerar']);
  };

  return api.generatedResumeExists().pipe(
    map(({ exists }) => (exists ? true : redirectWithMessage())),
    catchError(() => of(redirectWithMessage()))
  );
};
