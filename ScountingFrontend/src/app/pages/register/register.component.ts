import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { DialogService } from '../../services/dialog.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .spinner { width: 1rem; height: 1rem; border-width: .2rem; }
  `],
  template: `
<div class="min-vh-100 d-flex align-items-center justify-content-center bg-success-subtle">
  <div class="card shadow" style="max-width: 520px; width: 100%">
    <div class="card-body p-4">
      <div class="text-center mb-3">
        <i class="bi bi-trophy text-success" style="font-size: 2rem"></i>
        <h5 class="mt-2 mb-0">Criar conta</h5>
        <small class="text-muted">Scouting - Olheiro de Futebol</small>
      </div>

      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Nome</label>
            <input [(ngModel)]="nome" name="nome" type="text" class="form-control" required />
          </div>
          <div class="col-12">
            <label class="form-label">Email</label>
            <input [(ngModel)]="email" name="email" type="email" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Senha</label>
            <input [(ngModel)]="senha" name="senha" type="password" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Confirmar senha</label>
            <input [(ngModel)]="confirmar" name="confirmar" type="password" class="form-control" required />
          </div>
          <div class="col-12">
            <small class="text-muted">Perfil padrão: Olheiro</small>
          </div>
          <div class="col-12 d-grid">
            <button class="btn btn-success d-inline-flex align-items-center justify-content-center gap-2" [disabled]="f.invalid || loading">
              @if (loading) { <span class="spinner-border spinner" role="status"></span> }
              <span>{{ loading ? 'Cadastrando...' : 'Cadastrar' }}</span>
            </button>
          </div>
        </div>
      </form>

      <div class="mt-3 text-center">
        <a routerLink="/login" class="text-decoration-none">Já tem conta? Entrar</a>
      </div>
    </div>
  </div>
</div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private toast = inject(ToastService);

  nome = '';
  email = '';
  senha = '';
  confirmar = '';
  loading = false;

  async onSubmit() {
    if (this.loading) return;
    if (this.senha !== this.confirmar) {
      await this.dialog.alert('As senhas não conferem');
      return;
    }

    this.loading = true;
    this.auth.register({ nome: this.nome, email: this.email, senha: this.senha, perfil: 'O' }).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso. Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => this.toast.error(err?.error?.message ?? 'Falha ao criar conta'),
      complete: () => {
        this.loading = false;
      }
    });
  }
}

