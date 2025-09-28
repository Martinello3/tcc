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
      { path: 'jogadores/:id/perfil', loadComponent: () => import('./pages/jogadores/perfil-jogador.component').then(m => m.PerfilJogadorComponent) },

      { path: 'avaliacoes', pathMatch: 'full', redirectTo: 'jogadores' },
      { path: 'avaliacoes/:jogadorId', loadComponent: () => import('./pages/avaliacoes/avaliacoes-historico.component').then(m => m.AvaliacoesHistoricoComponent) },
      { path: 'avaliacoes/:jogadorId/novo', loadComponent: () => import('./pages/avaliacoes/avaliacao-form.component').then(m => m.AvaliacaoFormComponent) },

      { path: 'relatorios', pathMatch: 'full', redirectTo: '' },
      { path: 'relatorios/avaliacao/:jogadorId/:avaliacaoId', loadComponent: () => import('./pages/relatorios/relatorio-avaliacao-page.component').then(m => m.RelatorioAvaliacaoPageComponent) },


      { path: 'profile/config', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'profile/conta', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
