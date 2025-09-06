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
  `],
  template: `
<div class="min-vh-100 d-flex align-items-center justify-content-center bg-success-subtle">
  <div class="card shadow" style="max-width: 420px; width: 100%">
    <div class="card-body p-4">
      <div class="text-center mb-3">
        <i class="bi bi-shield-shaded text-success" style="font-size: 2rem"></i>
        <h5 class="mt-2 mb-0">Scouting</h5>
        <small class="text-muted">Olheiro de Futebol</small>
      </div>
      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Senha</label>
          <input [(ngModel)]="password" name="password" type="password" class="form-control" required />
        </div>
        <button class="btn btn-success w-100 d-flex align-items-center justify-content-center" [disabled]="f.invalid || loading">
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

