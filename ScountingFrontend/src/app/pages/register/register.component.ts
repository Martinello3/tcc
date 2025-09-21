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
    .brand-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: .5rem; }
    .brand-logo { height: 64px; width: auto; }
    .brand-title { margin: 0; font-weight: 700; font-size: 1.75rem; }
    .brand-subtitle { color: #6c757d; }
    .login-bg { min-height: 100vh; background: linear-gradient(180deg, rgba(11,22,53,.55) 0%, rgba(43,15,74,.55) 50%, rgba(11,22,53,.55) 100%), url('/brand/login-bg.jpg') center/cover no-repeat; display: flex; align-items: center; }
    .login-wrap { width: 100%; padding: 2rem; display: flex; justify-content: center; }
  `],
  template: `
<div class="login-bg">
  <div class="login-wrap">
    <div class="card shadow" style="max-width: 720px; width: 100%">
      <div class="card-body p-4">
        <div class="brand-header mb-3">
          <picture>
            <source srcset="/brand/seu-olheiro.svg" type="image/svg+xml" />
            <img src="/brand/seu-olheiro.png" alt="Seu Olheiro" class="brand-logo" />
          </picture>
          <div class="text-center">
            <h5 class="brand-title">Seu Olheiro</h5>
            <small class="brand-subtitle">Plataforma de scouting</small>
          </div>
        </div>
        <h5 class="mb-3 text-center">Criar conta</h5>

        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="row g-3 align-items-start">
            <!-- Foto à esquerda -->
            <div class="col-12 col-sm-auto mb-2 mb-sm-0">
              <label class="form-label d-block">Foto (opcional)</label>
              <div class="rounded border border-2 bg-white d-flex align-items-center justify-content-center"
                   style="width: 140px; height: 140px; cursor: pointer;"
                   (click)="fileUsuario.click()">
                @if (previewFoto || foto) {
                  <img [src]="fotoSrc(previewFoto || foto)" alt="foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: .25rem;" />
                } @else {
                  <i class="bi bi-plus-lg text-muted"></i>
                }
              </div>
              <input #fileUsuario type="file" class="d-none" accept="image/*" (change)="uploadUsuarioFoto($event)" />
              <div class="mt-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="removeFoto()" [disabled]="!(previewFoto || foto)">Remover</button>
              </div>
            </div>

            <!-- Campos ao lado da foto (todos os inputs) -->
            <div class="col-12 col-sm-8 col-md-9">
              <div class="row g-2">
                <div class="col-12">
                  <label class="form-label">Nome</label>
                  <input [(ngModel)]="nome" name="nome" type="text" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Email</label>
                  <input [(ngModel)]="email" name="email" type="email" class="form-control" required />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Senha</label>
                  <input [(ngModel)]="senha" name="senha" type="password" class="form-control" required />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Confirmar senha</label>
                  <input [(ngModel)]="confirmar" name="confirmar" type="password" class="form-control" required />
                </div>
              </div>
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
  foto: string | null = null;
  // Preview imediato da foto selecionada
  previewFoto: string | null = null;
  private previewObjectUrl: string | null = null;
  loading = false;

  async uploadUsuarioFoto(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    // Preview imediato
    if (this.previewObjectUrl) { URL.revokeObjectURL(this.previewObjectUrl); }
    this.previewObjectUrl = URL.createObjectURL(file);
    this.previewFoto = this.previewObjectUrl;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch('/api/Uploads/usuarios/foto', { method: 'POST', body: formData });
      if (!resp.ok) throw new Error('Falha no upload');
      const data = await resp.json();
      this.foto = data.path as string;
      this.previewFoto = this.foto;
      if (this.previewObjectUrl) { URL.revokeObjectURL(this.previewObjectUrl); this.previewObjectUrl = null; }
      this.toast.success('Foto enviada');
    } catch {
      this.toast.error('Não foi possível enviar a foto');
    }
  }

  removeFoto() {
    this.foto = null;
    this.previewFoto = null;
    if (this.previewObjectUrl) { URL.revokeObjectURL(this.previewObjectUrl); this.previewObjectUrl = null; }
  }

  fotoSrc(val: string | null | undefined): string | null {
    if (!val) return null;
    if (val.startsWith('blob:') || val.startsWith('data:') || /^https?:\/\//.test(val)) return val;
    const path = val.startsWith('/') ? val : '/' + val;
    if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
      return 'http://127.0.0.1:5180' + path;
    }
    return path;
  }


  async onSubmit() {
    if (this.loading) return;
    if (this.senha !== this.confirmar) {
      await this.dialog.alert('As senhas não conferem');
      return;
    }

    this.loading = true;
    this.auth.register({ nome: this.nome, email: this.email, senha: this.senha, perfil: 'O', foto: this.foto }).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso. Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status;
        const serverMsg = err?.error?.message as string | undefined;
        let msg = 'Falha ao criar conta';
        if (status === 0) msg = 'Falha de conexão com o servidor';
        else if (status === 409) msg = serverMsg || 'E-mail já cadastrado.';
        else if (status === 400) msg = serverMsg || 'Dados inválidos no cadastro.';
        else if (serverMsg) msg = serverMsg;
        this.toast.error(msg);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

