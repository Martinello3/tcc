import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .spinner { width: 1rem; height: 1rem; border-width: .2rem; }
    .auth-left { width: 100%; max-width: 560px; }
    .auth-right { flex: 1 1 auto; position: relative; background: linear-gradient(180deg, rgba(11,22,53,.55) 0%, rgba(43,15,74,.55) 50%, rgba(11,22,53,.55) 100%), url('/brand/login-bg.jpg') center/cover no-repeat; }
    .illustration { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .brand-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: .5rem; }
    .brand-logo { height: 64px; width: auto; }
    .brand-title { margin: 0; font-weight: 700; font-size: 1.75rem; }
    .brand-subtitle { color: #6c757d; }
    /* Novo layout: formulário solto sobre o fundo */
    .login-bg { min-height: 100vh; background: linear-gradient(180deg, rgba(11,22,53,.55) 0%, rgba(43,15,74,.55) 50%, rgba(11,22,53,.55) 100%), url('/brand/login-bg.jpg') center/cover no-repeat; display: flex; align-items: center; }
    .login-wrap { width: 100%; padding: 2rem; display: flex; justify-content: center; }
    @media (min-width: 992px) { .login-wrap { justify-content: center; padding-left: 0; } }
  `],
  template: `
<div class="login-bg">
  <div class="login-wrap">
    <div class="card shadow" style="max-width: 560px; width: 100%">
      <div class="card-body p-4">
        <div class="brand-header mb-4">
          <picture>
            <source srcset="/brand/seu-olheiro.svg" type="image/svg+xml" />
            <img src="/brand/seu-olheiro.png" alt="Seu Olheiro" class="brand-logo" (error)="onLogoError($event)" />
          </picture>
          <div class="text-center">
            <h5 class="brand-title">Seu Olheiro</h5>
            <small class="brand-subtitle">Plataforma de scouting</small>
          </div>
        </div>
        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input [(ngModel)]="email" name="email" type="email" class="form-control form-control-lg" required />
          </div>
          <div class="mb-2">
            <label class="form-label">Senha</label>
            <input [(ngModel)]="password" name="password" type="password" class="form-control form-control-lg" required />
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="rememberMe">
            <label class="form-check-label" for="rememberMe">Lembrar-me</label>
          </div>
          <button class="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center" [disabled]="f.invalid || loading">
            @if (!loading) { <span>Entrar</span> }
            @if (loading) {
              <span class="d-inline-flex align-items-center gap-2">
                <span class="spinner-border spinner" role="status"></span>
                Entrando...
              </span>
            }
          </button>
        </form>
        <div class="mt-3 text-center">
          <a routerLink="/register" class="text-decoration-none">Criar conta</a>
        </div>
        <div class="mt-4 small text-muted">© {{ currentYear }} Seu Olheiro</div>
      </div>
    </div>
  </div>
</div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  loading = false;
  currentYear = new Date().getFullYear();

  onLogoError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src.indexOf('/favicon.ico') === -1) {
      img.src = '/favicon.ico';
    }
  }

  onSubmit() {
    if (this.loading) return;
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (resp) => {
        this.auth.setSession(resp);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Falha ao autenticar');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

