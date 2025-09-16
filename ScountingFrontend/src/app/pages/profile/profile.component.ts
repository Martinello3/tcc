import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    .nav-tabs { border-bottom: 1px solid var(--border); }
    .nav-tabs .nav-link { color: var(--text-muted); border: 1px solid transparent; }
    .nav-tabs .nav-link.active { color: var(--text); background-color: var(--bg-elev); border-color: var(--border) var(--border) transparent; }

    .avatar-wrap { position: relative; display: inline-block; }
    .avatar-lg { width: 128px; height: 128px; border-radius: 50%; object-fit: cover; display:block; }
    .avatar-ph { width: 128px; height: 128px; border-radius: 50%; display:flex; align-items:center; justify-content:center; }
    .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.45); color: #fff; opacity: 0; display:flex; align-items:center; justify-content:center; border-radius: 50%; transition: opacity .2s; cursor: pointer; }
    .avatar-wrap:hover .avatar-overlay { opacity: 1; }

    .danger-card { border: 1px solid #7f1d1d; background: rgba(239,68,68,.08); }

    /* Modal básico */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); }
    .modal-panel { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); width: 100%; max-width: 520px; }

    /* Readonly control without border */
    .readonly-control { display: block; width: 100%; position: relative; box-sizing: border-box; padding: 0.5rem 0; border: none; background: transparent; }
    .readonly-control .lock { position: absolute; left: 0; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .readonly-control .text { display: block; padding-left: 1.5rem; color: var(--text-muted); }
  `],
  template: `
<div class="container py-3">
  <div class="mb-3">
    <h3 class="m-0"><i class="bi bi-person-circle text-success"></i> Meu Perfil</h3>
  </div>

  <ul class="nav nav-tabs mb-3">
    <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='perfil'" (click)="activeTab='perfil'">Perfil</button></li>
    <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='conta'" (click)="activeTab='conta'">Conta</button></li>
  </ul>

  @if (activeTab==='perfil') {
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="row g-4 align-items-start">
          <!-- Coluna Esquerda: Avatar e identidade -->
          <div class="col-md-4 text-center">
            <div class="avatar-wrap" (click)="fileInput.click()">
              @if (avatarUrl) {
                <img [src]="avatarUrl" alt="Foto do usuário" class="avatar-lg" />
              } @else {
                <div class="avatar-ph bg-success-subtle text-success" >
                  <i class="bi bi-person" style="font-size: 3rem"></i>
                </div>
              }
              <div class="avatar-overlay"><i class="bi bi-camera"></i>&nbsp; Alterar Foto</div>
            </div>
            <input #fileInput type="file" class="d-none" accept="image/*" (change)="uploadFoto($event)" />
            <div class="mt-3">
              <div class="fw-semibold fs-5">{{ editingName || user?.nome }}</div>
              <div class="text-muted small">{{ user?.email }}</div>
              <div class="badge text-bg-success mt-2">{{ perfilLabel(user?.perfil) }}</div>
            </div>
          </div>

          <!-- Coluna Direita: Formulário -->
          <div class="col-md-8">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <strong>Informações</strong>
              <button class="btn btn-success" (click)="onSave()" [disabled]="saving || !isDirty()">
                @if (!saving) { <span>Salvar</span> } @else { <span class="spinner-border spinner-border-sm" role="status"></span><span> Salvando...</span> }
              </button>
            </div>
            <div class="row g-3">
              <div class="col-12 col-lg-6">
                <label class="form-label">Nome</label>
                <input class="form-control" [value]="editingName" (input)="editingName = $any($event.target).value" />
              </div>
              <div class="col-12 col-lg-6">
                <label class="form-label">Email</label>
                <div class="readonly-control">
                  <i class="bi bi-lock-fill lock"></i>
                  <span class="text">{{ user?.email }}</span>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <label class="form-label">Perfil</label>
                <div class="readonly-control">
                  <i class="bi bi-lock-fill lock"></i>
                  <span class="text">{{ perfilLabel(user?.perfil) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  } @else {
    <div class="card shadow-sm danger-card">
      <div class="card-body">
        <h5 class="text-danger d-flex align-items-center gap-2"><i class="bi bi-exclamation-triangle-fill"></i> Zona de Perigo</h5>
        <p class="text-muted">Excluir sua conta é permanente. Todos os seus dados, incluindo jogadores e avaliações, serão removidos.</p>
        <button class="btn btn-danger" (click)="openDelete()"><i class="bi bi-trash"></i> Excluir minha conta</button>
      </div>
    </div>

    <!-- Modal de confirmação -->
    @if (showDelete) {
      <div class="modal-backdrop" (click)="closeDelete()"></div>
      <div class="modal-panel">
        <div class="card shadow-lg">
          <div class="card-header d-flex align-items-center justify-content-between">
            <strong>Confirmar exclusão</strong>
            <button class="btn btn-sm btn-outline-secondary" (click)="closeDelete()"><i class="bi bi-x"></i></button>
          </div>
          <div class="card-body">
            <p class="mb-3">Tem certeza de que deseja excluir sua conta? Esta ação é irreversível.</p>
            <label class="form-label">Digite sua senha para confirmar</label>
            <input type="password" class="form-control" [(ngModel)]="deletePassword" />
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" (click)="closeDelete()">Cancelar</button>
            <button class="btn btn-danger" [disabled]="deleting || !deletePassword" (click)="confirmDelete()">
              @if (!deleting) { <span>Excluir Permanentemente</span> } @else { <span class="spinner-border spinner-border-sm" role="status"></span> Excluindo... }
            </button>
          </div>
        </div>
      </div>
    }
  }
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

  activeTab: 'perfil' | 'conta' = 'perfil';
  originalName: string = '';
  originalFoto: string | null = null;

  showDelete = false;
  deletePassword = '';
  deleting = false;

  private router = inject(Router);
  private toast = inject(ToastService);

  ngOnInit() {
    const id = (this.user as any)?.id;
    if (id) {
      this.http.get<any>(`/api/Usuarios/${id}`).subscribe({ next: (u) => {
        this.apiUser = u;
        this.foto = u?.foto ?? null;
        this.editingName = u?.nome ?? this.user?.nome ?? '';
        this.originalName = this.editingName;
        this.originalFoto = this.foto;
      }});
    } else {
      this.editingName = this.user?.nome ?? '';
      this.originalName = this.editingName;
      this.originalFoto = this.foto;
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
      const id = (this.user as any)?.id;
      const url = id ? `/api/usuarios/meu-perfil/avatar?userId=${id}` : `/api/usuarios/meu-perfil/avatar`;
      const resp = await fetch(url, { method: 'POST', body: form });
      if (!resp.ok) throw new Error('Falha no upload');
      const data = await resp.json();
      this.foto = data.path as string;
      this.toast.success('Foto atualizada');
    } catch {
      this.toast.error('Falha ao enviar a foto do perfil');
    }
  }

  onSave() {
    if (this.saving) return;
    const id = (this.user as any)?.id;
    if (!id) return;
    if (!this.isDirty()) return;
    this.saving = true;
    const body: any = { nome: this.editingName };
    this.http.put(`/api/usuarios/meu-perfil?userId=${id}`, body).subscribe({ next: () => {
      // Atualiza cache local do usuário para refletir o novo nome no app
      try {
        const raw = localStorage.getItem('scouting_user');
        const cur = raw ? JSON.parse(raw) : null;
        if (cur) {
          cur.nome = this.editingName;
          localStorage.setItem('scouting_user', JSON.stringify(cur));
        }
        this.originalName = this.editingName;
        this.originalFoto = this.foto;
        this.toast.success('Perfil salvo com sucesso');
      } catch {}
    }, error: () => {
      this.toast.error('Falha ao salvar o perfil');
    }, complete: () => { this.saving = false; } });
  }

  isDirty() {
    const nm = (this.editingName || '').trim();
    const onm = (this.originalName || '').trim();
    return nm !== onm || this.foto !== this.originalFoto;
  }

  openDelete() { this.showDelete = true; this.deletePassword = ''; }
  closeDelete() { if (!this.deleting) { this.showDelete = false; } }
  confirmDelete() {
    if (this.deleting || !this.deletePassword) return;
    this.deleting = true;
    const id = (this.user as any)?.id;
    const url = id ? `/api/usuarios/minha-conta?userId=${id}` : '/api/usuarios/minha-conta';
    this.http.request('DELETE', url, { body: { senha: this.deletePassword } }).subscribe({
      next: () => {
        // Logout e redireciona para login
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: () => { this.deleting = false; },
      complete: () => { this.deleting = false; }
    });
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

