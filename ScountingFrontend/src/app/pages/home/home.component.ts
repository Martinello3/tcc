import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  styles: [`
  .sidebar { width: 260px; }
  .menu-item { cursor: pointer; border-radius: .5rem; padding: .5rem .5rem; transition: background-color .2s ease; }
  .menu-item:hover { background-color: #f1f3f5; }
  .menu-item.active { background-color: #e9f7ef; color: #198754; font-weight: 600; }
  .menu-link { text-decoration: none; color: inherit; display: flex; align-items: center; gap: .5rem; width: 100%; }
  `],
  template: `
<div class="d-flex min-vh-100">
  <!-- Sidebar -->
  <nav class="sidebar border-end p-3 bg-white">
    <div class="d-flex align-items-center mb-3">
      <i class="bi bi-trophy text-success" style="font-size: 1.5rem"></i>
      <span class="ms-2 fw-semibold">Scouting</span>
    </div>
    <div class="text-muted text-uppercase small mb-2">Navegação</div>
    <ul class="list-unstyled">
      <li class="menu-item" (click)="go('/jogadores')">
        <a class="menu-link" routerLink="/jogadores">
          <i class="bi bi-people"></i>
          <span>Jogadores</span>
        </a>
      </li>
      <li class="menu-item" (click)="go('/avaliacoes')">
        <a class="menu-link" routerLink="/avaliacoes">
          <i class="bi bi-clipboard2-check"></i>
          <span>Avaliações</span>
        </a>
      </li>
      <li class="menu-item" (click)="go('/clubes')">
        <a class="menu-link" routerLink="/clubes">
          <i class="bi bi-building"></i>
          <span>Clubes</span>
        </a>
      </li>
      <li class="menu-item" (click)="go('/relatorios')">
        <a class="menu-link" routerLink="/relatorios">
          <i class="bi bi-file-earmark-text"></i>
          <span>Relatórios</span>
        </a>
      </li>
      <li class="menu-item" (click)="go('/profile')">
        <a class="menu-link" routerLink="/profile">
          <i class="bi bi-person-circle"></i>
          <span>Perfil</span>
        </a>
      </li>
    </ul>
    <div class="border-top mt-3 pt-3">
      <div class="small text-muted">Perfil</div>
      <div class="d-flex align-items-center mt-1">
        <div class="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
          <i class="bi bi-person"></i>
        </div>
        <div class="ms-2">
          <div class="fw-semibold">{{ user?.nome || 'Olheiro' }}</div>
          <div class="text-muted small">{{ user?.email || 'olheiro@clube.com' }}</div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <div class="flex-grow-1">
    <header class="d-flex align-items-center justify-content-between border-bottom px-3 py-2 bg-light">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-geo-alt text-success"></i>
        <strong>Dashboard</strong>
      </div>
      <div class="d-flex gap-2">
        <a class="btn btn-outline-primary btn-sm" routerLink="/profile"><i class="bi bi-person"></i> Perfil</a>
        <button class="btn btn-outline-secondary btn-sm" (click)="onLogout()"><i class="bi bi-box-arrow-right"></i> Sair</button>
      </div>
    </header>
    <main class="p-3 position-relative">
      <router-outlet />
    </main>
  </div>
</div>
  `
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.user();

  go(path: string) {
    this.router.navigate([path]);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

