import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/matches', pathMatch: 'full' },
  { path: 'matches', canActivate: [authGuard], children: [] },
  { path: 'predictions', canActivate: [authGuard], children: [] },
  { path: 'leaderboard', children: [] },
  { path: 'auth', children: [] }
];
