import { Routes } from '@angular/router';
import { rootRedirectGuard } from './root-redirect.guard';
import { editorGuard } from './editor.guard';

export const routes: Routes = [
  // Root redirect — guard decides whether to go to /curriculo-base or /gerar
  {
    path: '',
    canActivate: [rootRedirectGuard],
    // Dummy component; the guard always redirects before the component renders.
    loadComponent: () =>
      import('./pages/curriculo-base').then((m) => m.CurriculoBase),
  },

  // Main application routes
  {
    path: 'curriculo-base',
    loadComponent: () =>
      import('./pages/curriculo-base').then((m) => m.CurriculoBase),
  },
  {
    path: 'gerar',
    loadComponent: () =>
      import('./pages/gerar').then((m) => m.Gerar),
  },
  {
    path: 'editor',
    canActivate: [editorGuard],
    loadComponent: () =>
      import('./pages/editor').then((m) => m.Editor),
  },

  // Wildcard — fall back to /curriculo-base for unknown paths
  { path: '**', redirectTo: '/curriculo-base' },
];
