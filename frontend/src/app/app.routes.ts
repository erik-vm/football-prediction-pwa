import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';

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
    path: '**',
    redirectTo: ''
  }
];
