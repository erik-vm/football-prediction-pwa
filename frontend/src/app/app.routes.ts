import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'predictions',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/predictions/predictions-list/predictions-list.component').then(m => m.PredictionsListComponent)
      },
      {
        path: ':matchId',
        loadComponent: () => import('./features/predictions/prediction-form/prediction-form.component').then(m => m.PredictionFormComponent)
      }
    ]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/leaderboard/overall/overall-leaderboard.component').then(m => m.OverallLeaderboardComponent)
      },
      {
        path: 'weekly',
        loadComponent: () => import('./features/leaderboard/weekly/weekly-leaderboard.component').then(m => m.WeeklyLeaderboardComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('./features/leaderboard/user-stats/user-stats.component').then(m => m.UserStatsComponent)
      }
    ]
  },
  {
    path: 'preferences',
    canActivate: [authGuard],
    loadComponent: () => import('./features/preferences/competition-preferences/competition-preferences.component').then(m => m.CompetitionPreferencesComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'tournaments',
        loadComponent: () => import('./features/admin/tournaments/tournament-list.component').then(m => m.TournamentListComponent)
      },
      {
        path: 'tournaments/new',
        loadComponent: () => import('./features/admin/tournaments/tournament-form.component').then(m => m.TournamentFormComponent)
      },
      {
        path: 'tournaments/:id/edit',
        loadComponent: () => import('./features/admin/tournaments/tournament-form.component').then(m => m.TournamentFormComponent)
      },
      {
        path: 'matches',
        loadComponent: () => import('./features/admin/matches/match-list.component').then(m => m.MatchListComponent)
      },
      {
        path: 'matches/new',
        loadComponent: () => import('./features/admin/matches/match-form.component').then(m => m.MatchFormComponent)
      },
      {
        path: 'matches/:id/edit',
        loadComponent: () => import('./features/admin/matches/match-form.component').then(m => m.MatchFormComponent)
      },
      {
        path: 'results',
        loadComponent: () => import('./features/admin/results/result-entry.component').then(m => m.ResultEntryComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
