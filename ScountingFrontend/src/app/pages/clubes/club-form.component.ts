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
<div class="d-flex align-items-center justify-content-between mb-3">
  <h5 class="mb-0">{{ id ? 'Editar clube' : 'Novo clube' }}</h5>
  <div>
    <a class="btn btn-outline-secondary me-2" routerLink="/clubes">Voltar</a>
    <button class="btn btn-success d-inline-flex align-items-center gap-2" (click)="onSave()" [disabled]="form.invalid || saving">
  @if (!saving) { <span>Salvar</span> }
  @if (saving) { <span class="spinner-border spinner-border-sm" role="status"></span><span>Salvando...</span> }
</button>
  </div>
</div>

<div class="card shadow-sm">
  <div class="card-body">
    <form [formGroup]="form" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Nome</label>
        <input class="form-control" formControlName="nome" />
      </div>
      <div class="col-md-6">
        <label class="form-label">País</label>
        <select class="form-select" formControlName="pais">
          <option value="">- Selecionar -</option>
          <option *ngFor="let p of paises" [value]="p">{{ p }}</option>
        </select>
      </div>
      @if (showEstados) {
        <div class="col-md-6">
          <label class="form-label">Estado</label>
          <select class="form-select" formControlName="estado">
            <option value="">- Selecionar -</option>
            <option *ngFor="let e of estados" [value]="e">{{ e }}</option>
          </select>
        </div>
      } @else {
        <div class="col-md-6">
          <label class="form-label">Estado</label>
          <input class="form-control" formControlName="estado" placeholder="Estado/Província" />
        </div>
      }
      <div class="col-md-6">
        <label class="form-label">Cidade</label>
        <input class="form-control" formControlName="cidade" placeholder="Digite a cidade" />
      </div>
    </form>
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
    };
    if (this.id) {
      this.svc.update(this.id, payload).subscribe({ next: () => {
        this.toast.success('Clube atualizado');
        this.router.navigate(['/clubes']);
      }, error: () => this.toast.error('Falha ao atualizar clube'), complete: () => { this.saving = false; } });
    } else {
      this.svc.create(payload).subscribe({ next: () => {
        this.toast.success('Clube criado');
        this.router.navigate(['/clubes']);
      }, error: () => this.toast.error('Falha ao criar clube'), complete: () => { this.saving = false; } });
    }
  }
}

