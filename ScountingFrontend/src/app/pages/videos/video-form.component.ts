import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VideosService } from '../../services/videos.service';
import type { Video, VideoUpsert } from '../../models/video';
import { ToastService } from '../../services/toast.service';
import { JogadoresService } from '../../services/jogadores.service';

@Component({
  selector: 'app-video-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="d-flex align-items-center justify-content-between mb-3">
  <h5 class="mb-0">{{ id ? 'Editar vídeo' : 'Novo vídeo' }}</h5>
  <div>
    <a class="btn btn-outline-secondary me-2" routerLink="/videos">Voltar</a>
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
        <label class="form-label">Arquivo/URL do vídeo</label>
        <input class="form-control mb-2" formControlName="caminhoVideo" placeholder="Ex.: https://... ou /uploads/videos/..." />
        <input type="file" class="form-control" (change)="onFileSelected($event)" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Data</label>
        <input type="date" class="form-control" formControlName="dataEnvio" />
      </div>
      <div class="col-md-9">
        <label class="form-label">Marcações</label>
        <input class="form-control" formControlName="marcacoes" placeholder="Ex.: #gol #assistencia" />
      </div>
    </form>
  </div>
</div>
  `
})
export class VideoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(VideosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private jogadoresSvc = inject(JogadoresService);

  id: number | null = null;
  saving = false;
  jogadores: { id: number; nome: string }[] = [];

  form = this.fb.group({
    jogadorId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    caminhoVideo: this.fb.control<string | null>(null),
    dataEnvio: this.fb.control<string | null>(null),
    marcacoes: this.fb.control<string | null>(null)
  });

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param && param !== 'novo' ? Number(param) : null;

    this.jogadoresSvc.list().subscribe({ next: (res) => this.jogadores = res.map(j => ({ id: j.id, nome: j.nome })) });

    if (this.id) {
      this.svc.get(this.id).subscribe({ next: (v: Video) => this.form.patchValue({
        jogadorId: v.jogadorId,
        caminhoVideo: v.caminhoVideo ?? null,
        dataEnvio: v.dataEnvio ?? null,
        marcacoes: v.marcacoes ?? null,
      }) });
    }
  }

  onSave() {
    if (this.saving || this.form.invalid) return;
    this.saving = true;
    const raw = this.form.getRawValue();
    const dataISO = raw.dataEnvio ? new Date(raw.dataEnvio as string).toISOString() : null;
    const payload: VideoUpsert = {
      jogadorId: Number(raw.jogadorId!),
      caminhoVideo: raw.caminhoVideo ?? null,
      dataEnvio: dataISO,
      marcacoes: raw.marcacoes ?? null,
    };

    if (this.id) {
      this.svc.update(this.id, payload).subscribe({ next: () => {
        this.toast.success('Vídeo atualizado');
        this.router.navigate(['/videos']);
      }, error: () => this.toast.error('Falha ao atualizar vídeo'), complete: () => { this.saving = false; } });
    } else {
      this.svc.create(payload).subscribe({ next: () => {
        this.toast.success('Vídeo criado');
        this.router.navigate(['/videos']);
      }, error: () => this.toast.error('Falha ao criar vídeo'), complete: () => { this.saving = false; } });
    }
  }

  async onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('/api/Videos/upload', { method: 'POST', body: form });
      if (!resp.ok) throw new Error('Falha no upload');
      const data = await resp.json();
      const path = data.path as string;
      this.form.get('caminhoVideo')?.setValue(path);
      this.toast.success('Upload concluído');
    } catch {
      this.toast.error('Não foi possível enviar o arquivo');
    }
  }

}

