import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
  .sidebar { width: 260px; }
  .menu-item { cursor: pointer; }
  .menu-item:hover { background-color: #f8f9fa; }
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
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-people me-2"></i>
        Jogadores
      </li>
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-clipboard2-check me-2"></i>
        Avaliações
      </li>
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-hospital me-2"></i>
        Lesões
      </li>
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-building me-2"></i>
        Clubes
      </li>
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-film me-2"></i>
        Vídeos
      </li>
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-file-earmark-text me-2"></i>
        Relatórios
      </li>
      <li class="menu-item rounded px-2 py-2 d-flex align-items-center">
        <i class="bi bi-person-circle me-2"></i>
        <a class="text-decoration-none" routerLink="/profile">Perfil</a>
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
    <main class="p-3">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-graph-up-arrow text-success" style="font-size: 2rem"></i>
                <div class="ms-2">
                  <div class="text-muted small">Relatórios recentes</div>
                  <div class="fs-5 fw-semibold">12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-person-bounding-box text-success" style="font-size: 2rem"></i>
                <div class="ms-2">
                  <div class="text-muted small">Jogadores avaliados</div>
                  <div class="fs-5 fw-semibold">34</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-camera-reels text-success" style="font-size: 2rem"></i>
                <div class="ms-2">
                  <div class="text-muted small">Vídeos recentes</div>
                  <div class="fs-5 fw-semibold">6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mt-3">
        <div class="card-header bg-white">
          <strong>Atalhos</strong>
        </div>
        <div class="card-body d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-success"><i class="bi bi-person-plus"></i> Novo jogador</button>
          <button class="btn btn-outline-success"><i class="bi bi-clipboard2-plus"></i> Nova avaliação</button>
          <button class="btn btn-outline-success"><i class="bi bi-upload"></i> Enviar vídeo</button>
        </div>
      </div>
    </main>
  </div>
</div>
  `
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.user();

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

