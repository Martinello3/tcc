import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="container py-3">
  <div class="d-flex align-items-center mb-3">
    <i class="bi bi-person-circle text-success" style="font-size: 2rem"></i>
    <h5 class="ms-2 mb-0">Meu Perfil</h5>
  </div>

  <div class="row g-3">
    <div class="col-md-4">
      <div class="card shadow-sm">
        <div class="card-body text-center">
          <div class="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
            <i class="bi bi-person" style="font-size: 2rem"></i>
          </div>
          <div class="mt-2 fw-semibold">{{ user?.nome }}</div>
          <div class="text-muted small">{{ user?.email }}</div>
          <div class="badge text-bg-success mt-2">Perfil: {{ perfilLabel(user?.perfil) }}</div>
        </div>
      </div>
    </div>

    <div class="col-md-8">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <strong>Informações</strong>
        </div>
        <div class="card-body">
          <dl class="row mb-0">
            <dt class="col-sm-3">Nome</dt>
            <dd class="col-sm-9">{{ user?.nome }}</dd>

            <dt class="col-sm-3">Email</dt>
            <dd class="col-sm-9">{{ user?.email }}</dd>

            <dt class="col-sm-3">Perfil</dt>
            <dd class="col-sm-9">{{ perfilLabel(user?.perfil) }}</dd>
          </dl>
        </div>
      </div>

      <div class="mt-3 d-flex gap-2">
        <a class="btn btn-outline-secondary" routerLink="/">Voltar</a>
        <button class="btn btn-outline-danger" (click)="logout()"><i class="bi bi-box-arrow-right"></i> Sair</button>
      </div>
    </div>
  </div>
</div>
  `
})
export class ProfileComponent {
  private auth = inject(AuthService);
  user = this.auth.user();

  perfilLabel(p?: string | null) {
    switch (p) {
      case 'A': return 'Administrador';
      case 'S': return 'Supervisor';
      case 'O': return 'Olheiro';
      default: return 'Usuário';
    }
  }

  logout() {
    this.auth.logout();
  }
}

