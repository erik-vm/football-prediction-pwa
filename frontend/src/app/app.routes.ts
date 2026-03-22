import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tournaments', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'tournaments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tournaments/tournament-list.component').then(m => m.TournamentListComponent)
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadComponent: () => import('./features/matches/match-list.component').then(m => m.MatchListComponent)
  },
  {
    path: 'predictions',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/predictions/my-predictions.component').then(m => m.MyPredictionsComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/predictions/prediction-form.component').then(m => m.PredictionFormComponent)
      }
    ]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
