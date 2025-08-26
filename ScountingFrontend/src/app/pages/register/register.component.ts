import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
            <button class="btn btn-success" [disabled]="f.invalid">Cadastrar</button>
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

  nome = '';
  email = '';
  senha = '';
  confirmar = '';

  onSubmit() {
    if (this.senha !== this.confirmar) {
      alert('As senhas não conferem');
      return;
    }

    this.auth.register({ nome: this.nome, email: this.email, senha: this.senha, perfil: 'O' }).subscribe({
      next: () => {
        alert('Conta criada com sucesso. Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert(err?.error?.message ?? 'Falha ao criar conta')
    });
  }
}

