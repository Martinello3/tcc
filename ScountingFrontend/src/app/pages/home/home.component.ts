import { Component, OnInit, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  styles: [`
  .sidebar { width: 260px; transition: width .2s ease; position: relative; overflow: visible; }
  .sidebar.collapsed { width: 72px; }
  .brand-text { transition: opacity .2s ease; }
  .sidebar.collapsed .brand-text { opacity: 0; visibility: hidden; width: 0; }

  /* Menu items */
  .menu-item { cursor: pointer; border-radius: .5rem; padding: .5rem .5rem; transition: background-color .2s ease,color .2s ease; }
  .menu-item:hover { background-color: rgba(255,255,255,.06); }
  .menu-link { text-decoration: none; color: inherit; display: flex; align-items: center; gap: .5rem; width: 100%; padding: .375rem .5rem .375rem .75rem; border-radius: .5rem; }
  .active-link { border-left: 6px solid #10B981; background-color: rgba(16,185,129,.18); color: #10B981; padding-left: 1rem; }

  .menu-text { white-space: nowrap; }
  .sidebar.collapsed .menu-text { display: none; }

  /* Collapsed alignment: center icons, remove left border highlight */
  .sidebar.collapsed .menu-link { justify-content: center; padding: .5rem 0; }
  .sidebar.collapsed .active-link { border-left: 0; padding-left: 0; background-color: rgba(16,185,129,.18); color: #10B981; }

  /* Profile area */
  .profile-toggle { cursor: pointer; border-radius: .5rem; padding: .375rem; transition: background-color .2s ease; width:100%; display:flex; align-items:center; gap:.5rem; }
  .profile-toggle:hover { background-color: rgba(255,255,255,.06); }
  .profile-texts { line-height: 1.1; }
  .sidebar.collapsed .profile-texts { display: none; }
  .sidebar.collapsed .profile-toggle { justify-content: center; padding: .25rem; }
  .sidebar.collapsed .profile-toggle .rounded-circle { width: 32px !important; height: 32px !important; min-width: 32px; min-height: 32px; border-radius: 50% !important; }
  .sidebar.collapsed .profile-toggle .bi-caret-down-fill { display: none; }

  /* Dropdown positioning */
  .dropdown-menu-dark { --bs-dropdown-bg: #1f2937; }
  .divider { border-top: 1px solid var(--bs-border-color-translucent); margin: .75rem 0; }
  .dropdown { position: relative; }
  .dropdown-menu { display: none; position: absolute; top: 100%; right: 0; min-width: 200px; margin-top: .25rem; z-index: 2000; }
  .sidebar.collapsed .dropdown-menu { left: calc(100% + .25rem); right: auto; top: 0; margin-top: 0; }
  .dropdown-menu.show { display: block; }
  `],
  template: `
<div class="d-flex min-vh-100">
  <!-- Sidebar -->
  <nav class="sidebar border-end border p-3 bg-elev" [class.collapsed]="collapsed">
    <div class="d-flex align-items-center mb-3">
      <picture>
        <source srcset="/brand/seu-olheiro.svg" type="image/svg+xml" />
        <img src="/brand/seu-olheiro.png" alt="Seu Olheiro" style="height: 24px; width: auto;" />
      </picture>
      <span class="ms-2 fw-semibold brand-text">Seu Olheiro</span>
    </div>
    <ul class="list-unstyled">
      <li class="menu-item">
        <a class="menu-link" routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
          <i class="bi bi-speedometer2"></i>
          <span class="menu-text">Dashboard</span>
        </a>
      </li>
      <li class="menu-item">
        <a class="menu-link" routerLink="/jogadores" routerLinkActive="active-link">
          <i class="bi bi-people"></i>
          <span class="menu-text">Jogadores</span>
        </a>
      </li>
      <li class="menu-item">
        <a class="menu-link" routerLink="/clubes" routerLinkActive="active-link">
          <i class="bi bi-building"></i>
          <span class="menu-text">Clubes</span>
        </a>
      </li>
    </ul>
    <div class="divider"></div>
    <div class="dropdown" #profileDrop>
      <div class="profile-toggle" (click)="toggleProfileMenu($event)" aria-expanded="false">
        <div class="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
          <i class="bi bi-person"></i>
        </div>
        <div class="ms-2 profile-texts">
          <div class="fw-semibold">{{ user?.nome || 'Olheiro' }}</div>
          <div class="text-muted small">{{ user?.email || 'olheiro@clube.com' }}</div>
        </div>
        <i class="bi bi-caret-down-fill ms-auto small"></i>
      </div>
      <ul class="dropdown-menu dropdown-menu-dark shadow" [class.show]="showProfileMenu">
        <li><a class="dropdown-item" routerLink="/profile" (click)="closeProfileMenu()"><i class="bi bi-person me-2"></i>Minha Conta</a></li>
        <li><hr class="dropdown-divider" /></li>
        <li><button class="dropdown-item" (click)="onLogout(); closeProfileMenu()"><i class="bi bi-box-arrow-right me-2"></i>Sair</button></li>
      </ul>
    </div>
  </nav>

  <!-- Content -->
  <div class="flex-grow-1">
    <header class="d-flex align-items-center justify-content-between border-bottom border px-3 py-2 bg-elev">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" (click)="toggleSidebar()" title="Colapsar menu">
          <i class="bi" [class.bi-chevron-double-left]="!collapsed" [class.bi-chevron-double-right]="collapsed"></i>
        </button>
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
  private theme = inject(ThemeService); // ensure ThemeService initializes on app load
  user = this.auth.user();

  collapsed = false;
  showProfileMenu = false;
  @ViewChild('profileDrop') profileDrop?: ElementRef<HTMLElement>;

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

  toggleSidebar() { this.collapsed = !this.collapsed; }

  toggleProfileMenu(ev: MouseEvent) { ev.stopPropagation(); this.showProfileMenu = !this.showProfileMenu; }
  closeProfileMenu() { this.showProfileMenu = false; }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const el = this.profileDrop?.nativeElement;
    if (!el) { this.showProfileMenu = false; return; }
    if (!el.contains(ev.target as Node)) { this.showProfileMenu = false; }
  }

  go(path: string) { this.router.navigate([path]); }

  onLogout() { this.auth.logout(); this.router.navigate(['/login']); }
}

