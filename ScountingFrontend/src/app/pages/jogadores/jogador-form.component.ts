import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JogadoresService } from '../../services/jogadores.service';
import { ClubesService } from '../../services/clubes.service';
import type { Jogador, JogadorUpsert } from '../../models/player';
import type { Clube } from '../../models/club';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-jogador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="d-flex align-items-center justify-content-between mb-3">
  <h5 class="mb-0">{{ id ? 'Editar jogador' : 'Novo jogador' }}</h5>
  <div>
    <a class="btn btn-outline-secondary me-2" routerLink="/jogadores">Voltar</a>
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
      <div class="col-md-3">
        <label class="form-label">Nascimento</label>
        <input type="date" class="form-control" formControlName="dataNascimento" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Posição</label>
        <select class="form-select" formControlName="posicao">
          <option value="">- Selecionar -</option>
          <option *ngFor="let p of posicoes" [value]="p">{{ p }}</option>
        </select>
      </div>

      <div class="col-md-3">
        <label class="form-label">Nacionalidade</label>
        <select class="form-select" formControlName="nacionalidade">
          <option value="">- Selecionar -</option>
          @for (n of nacionalidades; track n) {
            <option [value]="n">{{ n }}</option>
          }
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Altura (m)</label>
        <input type="number" step="0.01" class="form-control" formControlName="altura" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Peso (kg)</label>
        <input type="number" step="0.01" class="form-control" formControlName="peso" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Pé dominante</label>
        <select class="form-select" formControlName="peDominante">
          <option value="">- Selecionar -</option>
          <option value="Destro">Destro</option>
          <option value="Canhoto">Canhoto</option>
          <option value="Ambidestro">Ambidestro</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">Clube atual</label>
        <select class="form-select" formControlName="clubeAtualId">
          <option value="">- Nenhum -</option>
          @for (c of clubes; track c.id) {
            <option [value]="c.id">{{ c.nome }}</option>
          }
        </select>
      </div>

      <div class="col-12">
        <label class="form-label">Observações</label>
        <textarea rows="3" class="form-control" formControlName="observacoes"></textarea>
      </div>
    </form>
  </div>
</div>
  `
})
export class JogadorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(JogadoresService);
  private clubesSvc = inject(ClubesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  id: number | null = null;
  clubes: Clube[] = [];
  nacionalidades: string[] = [
    'Brasileiro', 'Argentino', 'Uruguaio', 'Paraguaio', 'Chileno', 'Colombiano', 'Peruano', 'Boliviano', 'Equatoriano', 'Venezuelano',
    'Português', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Inglês', 'Holandês', 'Belga', 'Suíço', 'Austríaco',
    'Americano', 'Mexicano', 'Canadense', 'Japonês', 'Coreano', 'Chinês'
  ];

  posicoes: string[] = [
    'Goleiro', 'Lateral Direito', 'Zagueiro', 'Lateral Esquerdo', 'Volante', 'Meia', 'Ponta', 'Atacante'
  ];

  saving = false;

  form = this.fb.group({
    nome: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    dataNascimento: this.fb.nonNullable.control('', { validators: [Validators.required, this.idadeValidator(13, 20)] }),
    nacionalidade: this.fb.control<string | null>(null),
    posicao: this.fb.control<string | null>(null),
    altura: this.fb.control<number | null>(null),
    peso: this.fb.control<number | null>(null),
    peDominante: this.fb.control<string | null>(null),
    clubeAtualId: this.fb.control<number | null>(null),
    foto: this.fb.control<string | null>(null),
    observacoes: this.fb.control<string | null>(null),
  });

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param && param !== 'novo' ? Number(param) : null;

    this.clubesSvc.list().subscribe({ next: (res) => (this.clubes = res) });

    if (this.id) {
      this.svc.get(this.id).subscribe({ next: (j: Jogador) => this.form.patchValue(j as any) });
    }

    // Atualiza validação ao mudar a data
    this.form.get('dataNascimento')?.valueChanges.subscribe(() => {
      this.form.get('dataNascimento')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  onSave() {
    if (this.saving || this.form.invalid) return;
    this.saving = true;
    const raw = this.form.getRawValue();
    const payload: JogadorUpsert = {
      nome: raw.nome!,
      dataNascimento: raw.dataNascimento!,
      nacionalidade: (raw.nacionalidade && raw.nacionalidade !== '') ? raw.nacionalidade : null,
      posicao: raw.posicao ?? null,
      altura: raw.altura ?? null,
      peso: raw.peso ?? null,
      peDominante: raw.peDominante ?? null,
      clubeAtualId: (raw.clubeAtualId && raw.clubeAtualId !== ('' as any)) ? Number(raw.clubeAtualId as any) : null,
      foto: raw.foto ?? null,
      observacoes: raw.observacoes ?? null,
    };
    if (this.id) {
      this.svc.update(this.id, payload).subscribe({ next: () => {
        this.toast.success('Jogador atualizado');
        this.router.navigate(['/jogadores']);
      }, error: () => this.toast.error('Falha ao atualizar jogador'), complete: () => { this.saving = false; } });
    } else {
      this.svc.create(payload).subscribe({ next: () => {
        this.toast.success('Jogador criado');
        this.router.navigate(['/jogadores']);
      }, error: () => this.toast.error('Falha ao criar jogador'), complete: () => { this.saving = false; } });
    }
  }

  // Validador: idade mínima e máxima (em anos) com base na data de nascimento
  idadeValidator(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string | null;
      if (!value) return null; // já existe Validators.required
      const birth = new Date(value);
      if (isNaN(birth.getTime())) return { invalidDate: true };

      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age < min) return { tooYoung: { min } };
      if (age > max) return { tooOld: { max } };
      return null;
    };
  }

}

