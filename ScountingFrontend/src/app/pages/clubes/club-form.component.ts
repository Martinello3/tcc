import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClubesService } from '../../services/clubes.service';
import type { Clube, ClubeUpsert } from '../../models/club';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-club-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="container">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="m-0"><i class="bi bi-building text-success"></i> {{ id ? 'Editar Clube' : 'Novo Clube' }}</h3>
    <div class="page-header-actions">
      <a class="btn btn-outline-secondary me-2" routerLink="/clubes">Voltar</a>
      <button class="btn btn-success d-inline-flex align-items-center gap-2" (click)="onSave()" [disabled]="form.invalid || saving">
        @if (!saving) { <span>Salvar</span> } @else { <span class="spinner-border spinner-border-sm" role="status"></span><span>Salvando...</span> }
      </button>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-header d-flex align-items-center justify-content-between">
      <strong>Dados do clube</strong>
    </div>
    <div class="card-body">
      <form [formGroup]="form">
        <div class="row gx-3 gy-2 align-items-start">
          <!-- Foto à esquerda -->
          <div class="col-12 col-sm-auto">
            <label class="form-label d-block">Foto do clube</label>
            <div class="rounded border border-2 bg-white d-flex align-items-center justify-content-center"
                 style="width: 160px; height: 160px; cursor: pointer;"
                 (click)="fileClube.click()">
              @if (previewFoto || form.value.foto) {
                <img [src]="fotoSrc(previewFoto || form.value.foto)" alt="foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: .25rem;" />
              } @else {
                <i class="bi bi-plus-lg fs-2 text-muted"></i>
              }
            </div>
            <input #fileClube type="file" class="d-none" accept="image/*" (change)="uploadClubeFoto($event)" />
            <div class="mt-2">
              <button type="button" class="btn btn-sm btn-outline-secondary" (click)="clearFoto()" [disabled]="!(previewFoto || form.value.foto)">Remover</button>
            </div>
          </div>

          <!-- Campos principais à direita da foto -->
          <div class="col-12 col-sm">
            <div class="row g-2">
              <div class="col-12">
                <label class="form-label">Nome <span class="text-danger" title="Obrigatrio">*</span></label>
                <input class="form-control form-control-sm" required [class.is-invalid]="form.controls.nome.invalid && form.controls.nome.touched" formControlName="nome" />
                <div class="invalid-feedback" [hidden]="!(form.controls.nome.errors?.['required'] && form.controls.nome.touched)">Informe o nome do clube.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">País</label>
                <select class="form-select form-select-sm" formControlName="pais">
                  <option value="">- Selecionar -</option>
                  @for (p of paises; track p) { <option [value]="p">{{ p }}</option> }
                </select>
              </div>
              @if (showEstados) {
                <div class="col-md-6">
                  <label class="form-label">Estado</label>
                  <select class="form-select form-select-sm" formControlName="estado">
                    <option value="">- Selecionar -</option>
                    @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
                  </select>
                </div>
              } @else {
                <div class="col-md-6">
                  <label class="form-label">Estado</label>
                  <input class="form-control form-control-sm" formControlName="estado" placeholder="Estado/Província" />
                </div>
              }
              <div class="col-md-6">
                <label class="form-label">Cidade</label>
                <input class="form-control form-control-sm" formControlName="cidade" placeholder="Digite a cidade" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
  `
})
export class ClubFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ClubesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  id: number | null = null;

  saving = false;

  // Preview imediato da foto
  previewFoto: string | null = null;
  private previewObjectUrl: string | null = null;

  paises: string[] = ['Brasil','Argentina','Uruguai','Chile','Paraguai','Colômbia','Peru','Bolívia','Equador','Venezuela','Portugal','Espanha','França','Itália','Alemanha','Inglaterra'];
  estados: string[] = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  get showEstados() {
    return this.form.get('pais')?.value === 'Brasil';
  }

  form = this.fb.group({
    nome: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    pais: this.fb.control<string | null>(null),
    estado: this.fb.control<string | null>(null),
    cidade: this.fb.control<string | null>(null),
    foto: this.fb.control<string | null>(null),
  });



  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param && param !== 'novo' ? Number(param) : null;

    if (this.id) {
      this.svc.get(this.id).subscribe({ next: (c: Clube) => {
        this.form.patchValue(c);
        this.setupPaisSubscription(); // só assina após carregar os dados, para não limpar o estado inicial
      }});
    } else {
      this.setupPaisSubscription();
    }
  }

  private setupPaisSubscription() {
    this.form.get('pais')?.valueChanges.subscribe(() => {
      // limpa estado ao trocar país manualmente
      this.form.get('estado')?.setValue(null);
      this.form.get('estado')?.updateValueAndValidity();
    });
  }

  onSave() {
    if (this.saving || this.form.invalid) return;
    this.saving = true;
    const raw = this.form.getRawValue();
    const payload: ClubeUpsert = {
      nome: raw.nome!,
      pais: raw.pais ?? null,
      estado: raw.estado ?? null,
      cidade: raw.cidade ?? null,
      foto: raw.foto ?? null,
    };
    const finalize = () => { this.saving = false; };
    if (this.id) {
      this.svc.update(this.id, payload).subscribe({
        next: () => { this.toast.success('Clube atualizado'); this.router.navigate(['/clubes']); },
        error: (err) => this.toast.error(err?.error?.message ?? 'Falha ao atualizar clube'),
        complete: finalize
      });
    } else {
      this.svc.create(payload).subscribe({
        next: () => { this.toast.success('Clube criado'); this.router.navigate(['/clubes']); },
        error: (err) => this.toast.error(err?.error?.message ?? 'Falha ao criar clube'),
        complete: finalize
      });
    }
  }

  async uploadClubeFoto(evt: Event) {
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
      const resp = await fetch('/api/Uploads/clubes/foto', { method: 'POST', body: formData });
      if (!resp.ok) throw new Error('Falha no upload');
      const data = await resp.json();
      const path = data.path as string;
      this.form.get('foto')?.setValue(path);
      this.previewFoto = path;
      if (this.previewObjectUrl) { URL.revokeObjectURL(this.previewObjectUrl); this.previewObjectUrl = null; }
      this.toast.success('Foto enviada');
    } catch {
      this.toast.error('Não foi possível enviar a foto');
    }
  }

  clearFoto() {
    this.form.get('foto')?.setValue(null);
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
}


