import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LesoesService } from '../../services/lesoes.service';
import type { Lesao, LesaoUpsert } from '../../models/lesao';
import { ToastService } from '../../services/toast.service';
import { JogadoresService } from '../../services/jogadores.service';

@Component({
  selector: 'app-lesao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="d-flex align-items-center justify-content-between mb-3">
  <h5 class="mb-0">{{ id ? 'Editar lesão' : 'Nova lesão' }}</h5>
  <div>
    <a class="btn btn-outline-secondary me-2" routerLink="/lesoes">Voltar</a>
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
        <label class="form-label">Jogador</label>
        <select class="form-select" formControlName="jogadorId">
          <option value="">- Selecionar -</option>
          @for (j of jogadores; track j.id) {
            <option [value]="j.id">{{ j.nome }}</option>
          }
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">Tipo da lesão</label>
        <select class="form-select" formControlName="tipoLesao">
          <option value="">- Selecionar -</option>
          <option value="M">Muscular</option>
          <option value="L">Ligamentar</option>
          <option value="O">Óssea</option>
          <option value="C">Contusão</option>
          <option value="N">Neurológica</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">Local do corpo</label>
        <select class="form-select" formControlName="localCorpo">
          <option value="">- Selecionar -</option>
          <option value="JL">Joelho</option>
          <option value="TB">Tíbia</option>
          <option value="CM">Coxa/Posterior</option>
          <option value="OM">Ombro</option>
          <option value="CT">Costas</option>
          <option value="OT">Outro</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Data de ocorrência</label>
        <input type="date" class="form-control" formControlName="dataOcorrencia" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Data de recuperação</label>
        <input type="date" class="form-control" formControlName="dataRecuperacao" />
      </div>
      <div class="col-12">
        <label class="form-label">Descrição</label>
        <input class="form-control" formControlName="descricao" />
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
export class LesaoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(LesoesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private jogadoresSvc = inject(JogadoresService);

  id: number | null = null;
  saving = false;
  jogadores: { id: number; nome: string }[] = [];

  form = this.fb.group({
    jogadorId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    tipoLesao: this.fb.control<string | null>(null),
    localCorpo: this.fb.control<string | null>(null),
    dataOcorrencia: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    dataRecuperacao: this.fb.control<string | null>(null),
    descricao: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    observacoes: this.fb.control<string | null>(null)
  });

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param && param !== 'novo' ? Number(param) : null;

    this.jogadoresSvc.list().subscribe({ next: (res) => this.jogadores = res.map(j => ({ id: j.id, nome: j.nome })) });

    if (this.id) {
      this.svc.get(this.id).subscribe({ next: (l: Lesao) => this.form.patchValue({
        jogadorId: l.jogadorId,
        tipoLesao: l.tipoLesao ?? null,
        localCorpo: l.localCorpo ?? null,
        dataOcorrencia: l.dataOcorrencia,
        dataRecuperacao: l.dataRecuperacao ?? null,
        descricao: l.descricao,
        observacoes: l.observacoes ?? null,
      }) });
    }
  }

  onSave() {
    if (this.saving || this.form.invalid) return;
    const o = this.form.value.dataOcorrencia as string;
    const r = this.form.value.dataRecuperacao as string | null;
    if (o && r && new Date(r) < new Date(o)) {
      this.toast.warning('Data de recuperação não pode ser antes da ocorrência');
      return;
    }
    this.saving = true;
    const raw = this.form.getRawValue();
    const payload: LesaoUpsert = {
      jogadorId: Number(raw.jogadorId!),
      tipoLesao: raw.tipoLesao ?? null,
      localCorpo: raw.localCorpo ?? null,
      dataOcorrencia: raw.dataOcorrencia!,
      dataRecuperacao: raw.dataRecuperacao ?? null,
      descricao: raw.descricao!,
      observacoes: raw.observacoes ?? null,
    };
    if (this.id) {
      this.svc.update(this.id, payload).subscribe({ next: () => {
        this.toast.success('Lesão atualizada');
        this.router.navigate(['/lesoes']);
      }, error: () => this.toast.error('Falha ao atualizar lesão'), complete: () => { this.saving = false; } });
    } else {
      this.svc.create(payload).subscribe({ next: () => {
        this.toast.success('Lesão criada');
        this.router.navigate(['/lesoes']);
      }, error: () => this.toast.error('Falha ao criar lesão'), complete: () => { this.saving = false; } });
    }
  }
}

