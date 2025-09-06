import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clubes', loadComponent: () => import('./pages/clubes/club-list.component').then(m => m.ClubListComponent) },
      { path: 'clubes/:id', loadComponent: () => import('./pages/clubes/club-form.component').then(m => m.ClubFormComponent) },
      { path: 'jogadores', loadComponent: () => import('./pages/jogadores/jogador-list.component').then(m => m.JogadorListComponent) },
      { path: 'jogadores/:id', loadComponent: () => import('./pages/jogadores/jogador-form.component').then(m => m.JogadorFormComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
