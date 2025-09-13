import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .avatar-lg { width: 112px; height: 112px; border-radius: 50%; object-fit: cover; cursor: pointer; }
    .avatar-ph { width: 112px; height: 112px; border-radius: 50%; cursor: pointer; }
  `],
  template: `
<div class="container py-3">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="m-0"><i class="bi bi-person-circle text-success"></i> Meu Perfil</h3>
  </div>

  <div class="row g-3">
    <div class="col-md-4">
      <div class="card shadow-sm">
        <div class="card-body text-center py-4">
          <div (click)="fileInput.click()">
            @if (avatarUrl) {
              <img [src]="avatarUrl" alt="Foto do usuário" class="avatar-lg" />
            } @else {
              <div class="avatar-ph bg-success-subtle text-success d-inline-flex align-items-center justify-content-center">
                <i class="bi bi-person" style="font-size: 2.75rem"></i>
              </div>
            }
          </div>
          <input #fileInput type="file" class="d-none" accept="image/*" (change)="uploadFoto($event)" />
          <div class="mt-3 fw-semibold fs-5">{{ editingName || user?.nome }}</div>
          <div class="text-muted">{{ user?.email }}</div>
          <div class="badge text-bg-success mt-2">{{ perfilLabel(user?.perfil) }}</div>
        </div>
      </div>
    </div>

    <div class="col-md-8">
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <strong>Informações</strong>
          <button class="btn btn-success btn-sm" (click)="onSave()" [disabled]="saving || !editingName || editingName.trim()===''">
            @if (!saving) { <span>Salvar</span> } @else { <span class="spinner-border spinner-border-sm" role="status"></span><span> Salvando...</span> }
          </button>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 col-md-8">
              <label class="form-label">Nome</label>
              <input class="form-control" [value]="editingName" (input)="editingName = $any($event.target).value" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Email</label>
              <input class="form-control" [value]="user?.email" disabled />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Perfil</label>
              <input class="form-control" [value]="perfilLabel(user?.perfil)" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  user = this.auth.user();

  apiUser: any = null;
  editingName: string = '';
  foto: string | null = null;
  saving = false;

  ngOnInit() {
    const id = (this.user as any)?.id;
    if (id) {
      this.http.get<any>(`/api/Usuarios/${id}`).subscribe({ next: (u) => {
        this.apiUser = u;
        this.foto = u?.foto ?? null;
        this.editingName = u?.nome ?? this.user?.nome ?? '';
      }});
    } else {
      this.editingName = this.user?.nome ?? '';
    }
  }

  private resolveUrl(val?: string | null): string | null {
    if (!val) return null;
    if (val.startsWith('blob:') || val.startsWith('data:') || /^https?:\/\//.test(val)) return val;
    const path = val.startsWith('/') ? val : '/' + val;
    if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
      return 'http://127.0.0.1:5180' + path;
    }
    return path;
  }

  get avatarUrl(): string | null {
    return this.resolveUrl(this.foto);
  }

  async uploadFoto(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('/api/Uploads/usuarios/foto', { method: 'POST', body: form });
      if (!resp.ok) throw new Error('Falha no upload');
      const data = await resp.json();
      this.foto = data.path as string;
    } catch {
      // silencia erro simples no upload; a tela de perfil não tem toast aqui
    }
  }

  onSave() {
    if (this.saving || !this.apiUser) return;
    this.saving = true;
    const id = this.apiUser.id;
    const payload = { ...this.apiUser, id, nome: this.editingName, foto: this.foto ?? null };
    this.http.put(`/api/Usuarios/${id}`, payload).subscribe({ next: () => {
      // Atualiza cache local do usuário para refletir o novo nome no app
      try {
        const raw = localStorage.getItem('scouting_user');
        const cur = raw ? JSON.parse(raw) : null;
        if (cur) {
          cur.nome = this.editingName;
          localStorage.setItem('scouting_user', JSON.stringify(cur));
        }
      } catch {}
    }, complete: () => { this.saving = false; } });
  }

  perfilLabel(p?: string | null) {
    switch (p) {
      case 'A': return 'Administrador';
      case 'S': return 'Supervisor';
      case 'O': return 'Olheiro';
      default: return 'Usuário';
    }
  }
}

