import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/matches', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadComponent: () => import('./features/matches/match-list.component').then(m => m.MatchListComponent)
  },
  { path: 'predictions', canActivate: [authGuard], children: [] },
  { path: 'leaderboard', children: [] }
];
