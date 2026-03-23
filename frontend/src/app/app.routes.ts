import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadComponent: () => import('./features/matches/match-list/match-list.component').then(m => m.MatchListComponent)
  },
  {
    path: 'predict/:matchId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/predictions/prediction-form/prediction-form.component').then(m => m.PredictionFormComponent)
  },
  {
    path: 'my-predictions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/predictions/my-predictions/my-predictions.component').then(m => m.MyPredictionsComponent)
  },
  {
    path: 'leaderboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/leaderboard/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: 'tournaments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tournaments/tournament-list/tournament-list.component').then(m => m.TournamentListComponent)
  },
  {
    path: 'preferences',
    canActivate: [authGuard],
    loadComponent: () => import('./features/preferences/preferences/preferences.component').then(m => m.PreferencesComponent)
  },
  { path: '', redirectTo: 'matches', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
