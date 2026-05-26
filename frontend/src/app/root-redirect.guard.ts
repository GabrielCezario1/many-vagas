import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Guard for the root `/` route.
 *
 * - If a BaseResume exists  → redirect to `/gerar`
 * - If no BaseResume exists → redirect to `/curriculo-base`
 * - On connectivity error   → redirect to `/curriculo-base` (fail-open)
 */
export const rootRedirectGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.baseResumeExists().pipe(
    map(({ exists }) =>
      router.createUrlTree([exists ? '/gerar' : '/curriculo-base'])
    ),
    catchError(() => of(router.createUrlTree(['/curriculo-base'])))
  );
};
