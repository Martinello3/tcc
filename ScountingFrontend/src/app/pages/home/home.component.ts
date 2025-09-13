import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  styles: [`
  .sidebar { width: 260px; }
  .menu-item { cursor: pointer; border-radius: .5rem; padding: .5rem .5rem; transition: background-color .2s ease; }
  .menu-item:hover { background-color: rgba(255,255,255,.06); }
  .menu-item.active { background-color: rgba(16,185,129,.15); color: #10B981; font-weight: 600; }
  .menu-link { text-decoration: none; color: inherit; display: flex; align-items: center; gap: .5rem; width: 100%; }
  .profile-quick { cursor: pointer; border-radius: .5rem; padding: .375rem; transition: background-color .2s ease; }
  .profile-quick:hover { background-color: rgba(255,255,255,.06); }
  `],
  template: `
<div class="d-flex min-vh-100">
  <!-- Sidebar -->
  <nav class="sidebar border-end border p-3 bg-elev">
    <div class="d-flex align-items-center mb-3">
      <img src="/brand/seu-olheiro.png" alt="Seu Olheiro" style="height: 24px; width: auto;" />
      <span class="ms-2 fw-semibold">Olheiro Pro</span>
    </div>
    <div class="text-muted text-uppercase small mb-2">Navegação</div>
    <ul class="list-unstyled">
      <li class="menu-item" (click)="go('')">
        <a class="menu-link" routerLink="/">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </a>
      </li>
      <li class="menu-item" (click)="go('/jogadores')">
        <a class="menu-link" routerLink="/jogadores">
          <i class="bi bi-people"></i>
          <span>Jogadores</span>
        </a>
      </li>
      <li class="menu-item" (click)="go('/clubes')">
        <a class="menu-link" routerLink="/clubes">
          <i class="bi bi-building"></i>
          <span>Clubes</span>
        </a>
      </li>
    </ul>
    <div class="border-top mt-3 pt-3">
      <div class="small text-muted">Perfil</div>
      <div class="d-flex align-items-center mt-1 profile-quick" (click)="go('/profile')">
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
    <header class="d-flex align-items-center justify-content-between border-bottom border px-3 py-2 bg-elev">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-geo-alt text-success"></i>
        <strong>Dashboard</strong>
      </div>
      <div class="d-flex align-items-center gap-2">
        @if (headerAvatarUrl) {
          <img [src]="headerAvatarUrl" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;" alt="avatar" />
        } @else {
          <div class="rounded-circle bg-elev border d-flex align-items-center justify-content-center" style="width:28px;height:28px;">
            <i class="bi bi-person"></i>
          </div>
        }
        <div class="d-none d-sm-block small">{{ headerName }}</div>
        <button class="btn btn-secondary btn-sm" (click)="onLogout()"><i class="bi bi-box-arrow-right"></i> Sair</button>
      </div>
    </header>
    <main class="p-3 position-relative">
      <router-outlet />
    </main>
  </div>
</div>
  `
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  user = this.auth.user();

  foto: string | null = null;
  apiUserName: string | null = null;

  ngOnInit() {
    const id = (this.user as any)?.id;
    if (id) {
      this.http.get<any>(`/api/Usuarios/${id}`).subscribe({ next: (u) => {
        this.foto = u?.foto ?? null;
        this.apiUserName = u?.nome ?? null;
      }});
    }
  }

  get headerName() { return this.apiUserName || this.user?.nome || 'Olheiro'; }

  private resolveUrl(val?: string | null): string | null {
    if (!val) return null;
    if (val.startsWith('blob:') || val.startsWith('data:') || /^https?:\/\//.test(val)) return val;
    const path = val.startsWith('/') ? val : '/' + val;
    if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
      return 'http://127.0.0.1:5180' + path;
    }
    return path;
  }
  get headerAvatarUrl(): string | null { return this.resolveUrl(this.foto); }

  go(path: string) {
    this.router.navigate([path]);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

