import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JogadoresService } from '../../services/jogadores.service';
import { ClubesService } from '../../services/clubes.service';
import type { Jogador, JogadorUpsert } from '../../models/player';
import type { Clube } from '../../models/club';
import type { Lesao, LesaoUpsert } from '../../models/lesao';
import type { Video, VideoUpsert } from '../../models/video';
import { LesoesService } from '../../services/lesoes.service';
import { VideosService } from '../../services/videos.service';
import { ToastService } from '../../services/toast.service';
import { forkJoin, of } from 'rxjs';
import { LoadingOverlayComponent } from '../../shared/loading-overlay.component';

@Component({
  selector: 'app-jogador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingOverlayComponent],
  templateUrl: './jogador-form.component.html',
  // template moved to HTML file
  /*
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

<nav class="mb-3">
  <ul class="nav nav-tabs">
    <li class="nav-item"><button type="button" class="nav-link" [class.active]="activeTab==='dados'" (click)="activeTab='dados'">Dados</button></li>
    <li class="nav-item"><button type="button" class="nav-link" [class.active]="activeTab==='lesoes'" (click)="activeTab='lesoes'">Lesões</button></li>
    <li class="nav-item"><button type="button" class="nav-link" [class.active]="activeTab==='videos'" (click)="activeTab='videos'">Vídeos</button></li>
  </ul>
</nav>
  </div>
</div>

<div class="card shadow-sm" *ngIf="activeTab==='dados'">
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
        <input type="number" step="0.01" min="1" max="3" class="form-control" formControlName="altura" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Peso (kg)</label>
        <input type="number" step="0.1" min="30" max="200" class="form-control" formControlName="peso" />
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

<div class="card shadow-sm mt-3" *ngIf="id">
  <div class="card-header d-flex align-items-center justify-content-between">
    <strong>Lesões do jogador</strong>
    <a class="btn btn-sm btn-success" [routerLink]="['/lesoes','novo']" [queryParams]="{ jogadorId: id }">Adicionar</a>
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-sm mb-0">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Local</th>
            <th>Ocorrência</th>
            <th>Recuperação</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          @for (l of lesoes; track l.id) {
            <tr>
              <td><span class="badge rounded-pill text-bg-secondary">{{ mapTipo(l.tipoLesao) }}</span></td>
              <td><span class="badge rounded-pill text-bg-info">{{ mapLocal(l.localCorpo) }}</span></td>

<div class="card shadow-sm" *ngIf="activeTab==='lesoes'">
  <div class="card-header d-flex align-items-center justify-content-between">
    <strong>Lesões do jogador</strong>
    <button class="btn btn-sm btn-success" (click)="openLesaoModal()">Adicionar</button>
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-sm mb-0">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Local</th>
            <th>Ocorrência</th>
            <th>Recuperação</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          @for (l of lesoes; track l.id) {
            <tr>
              <td><span class="badge rounded-pill text-bg-secondary">{{ mapTipo(l.tipoLesao) }}</span></td>
              <td><span class="badge rounded-pill text-bg-info">{{ mapLocal(l.localCorpo) }}</span></td>
              <td>{{ l.dataOcorrencia | date:'dd/MM/yyyy' }}</td>
              <td>{{ l.dataRecuperacao ? (l.dataRecuperacao | date:'dd/MM/yyyy') : '-' }}</td>
              <td>{{ l.descricao }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>

<div class="card shadow-sm mt-3" *ngIf="activeTab==='videos'">
  <div class="card-header d-flex align-items-center justify-content-between">
    <strong>Vídeos do jogador</strong>
    <button class="btn btn-sm btn-success" (click)="openVideoModal()">Adicionar</button>
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-sm mb-0">
        <thead>
          <tr>
            <th>Data</th>
  // Modais e formulários inline
  showLesaoModal = false;
  showVideoModal = false;

  lesaoForm = this.fb.group({
    descricao: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    dataOcorrencia: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    dataRecuperacao: this.fb.control<string | null>(null),
    tipoLesao: this.fb.control<string | null>(null),
    localCorpo: this.fb.control<string | null>(null),
    observacoes: this.fb.control<string | null>(null),
  });

  videoForm = this.fb.group({
    caminhoVideo: this.fb.control<string | null>(null),
    dataEnvio: this.fb.control<string | null>(null),
    marcacoes: this.fb.control<string | null>(null),
  });

  stagedLesoes: LesaoUpsert[] = [];
  stagedVideos: VideoUpsert[] = [];

  openLesaoModal() { this.lesaoForm.reset({ descricao: '', dataOcorrencia: '' }); this.showLesaoModal = true; }
  openVideoModal() { this.videoForm.reset(); this.showVideoModal = true; }
  closeLesaoModal() { this.showLesaoModal = false; }
  closeVideoModal() { this.showVideoModal = false; }

  async uploadVideoFile(evt: Event) {
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
      this.videoForm.get('caminhoVideo')?.setValue(path);
      this.toast.success('Upload concluído');
    } catch {
      this.toast.error('Não foi possível enviar o arquivo');
    }
  }

  confirmAddLesao() {
    if (this.lesaoForm.invalid) return;
    const raw = this.lesaoForm.getRawValue();
    // validação simples de datas
    if (raw.dataRecuperacao && raw.dataRecuperacao < raw.dataOcorrencia) {
      this.toast.error('Data de recuperação não pode ser antes da ocorrência');
      return;
    }
    if (this.id) {
      const payload: LesaoUpsert = { jogadorId: this.id, descricao: raw.descricao!, dataOcorrencia: raw.dataOcorrencia!, dataRecuperacao: raw.dataRecuperacao ?? null, tipoLesao: raw.tipoLesao ?? null, localCorpo: raw.localCorpo ?? null, observacoes: raw.observacoes ?? null };
      this.lesoesSvc.create(payload).subscribe({ next: (created) => {
        this.lesoes = [created, ...this.lesoes];
        this.toast.success('Lesão adicionada');
        this.closeLesaoModal();
      }, error: () => this.toast.error('Falha ao adicionar lesão') });
    } else {
      const staged: LesaoUpsert = { jogadorId: 0 as any, descricao: raw.descricao!, dataOcorrencia: raw.dataOcorrencia!, dataRecuperacao: raw.dataRecuperacao ?? null, tipoLesao: raw.tipoLesao ?? null, localCorpo: raw.localCorpo ?? null, observacoes: raw.observacoes ?? null };
      this.stagedLesoes = [staged, ...this.stagedLesoes];
      this.toast.success('Lesão adicionada (será salva ao salvar o jogador)');
      this.closeLesaoModal();
    }
  }

  confirmAddVideo() {
    const raw = this.videoForm.getRawValue();
    const dataISO = raw.dataEnvio ? new Date(raw.dataEnvio as string).toISOString() : null;
    if (this.id) {
      const payload: VideoUpsert = { jogadorId: this.id, caminhoVideo: raw.caminhoVideo ?? null, dataEnvio: dataISO, marcacoes: raw.marcacoes ?? null };
      this.videosSvc.create(payload).subscribe({ next: (created) => {
        this.videos = [created, ...this.videos];
        this.toast.success('Vídeo adicionado');
        this.closeVideoModal();
      }, error: () => this.toast.error('Falha ao adicionar vídeo') });
    } else {
      const staged: VideoUpsert = { jogadorId: 0 as any, caminhoVideo: raw.caminhoVideo ?? null, dataEnvio: dataISO, marcacoes: raw.marcacoes ?? null };
      this.stagedVideos = [staged, ...this.stagedVideos];
      this.toast.success('Vídeo adicionado (será salvo ao salvar o jogador)');
      this.closeVideoModal();
    }
  }

            <th>Arquivo/URL</th>
            <th>Marcações</th>
          </tr>
        </thead>
        <tbody>
          @for (v of videos; track v.id) {
            <tr>
              <td>{{ v.dataEnvio ? (v.dataEnvio | date:'dd/MM/yyyy') : '-' }}</td>
              <td>{{ v.caminhoVideo || '-' }}</td>
              <td>{{ v.marcacoes || '-' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>

              <td>{{ l.dataOcorrencia | date:'dd/MM/yyyy' }}</td>
              <td>{{ l.dataRecuperacao ? (l.dataRecuperacao | date:'dd/MM/yyyy') : '-' }}</td>
              <td>{{ l.descricao }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>

<div class="card shadow-sm mt-3" *ngIf="id">
  <div class="card-header d-flex align-items-center justify-content-between">
    <strong>Vídeos do jogador</strong>
    <a class="btn btn-sm btn-success" [routerLink]="['/videos','novo']" [queryParams]="{ jogadorId: id }">Adicionar</a>
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-sm mb-0">
        <thead>
          <tr>
            <th>Data</th>
            <th>Arquivo/URL</th>
            <th>Marcações</th>
          </tr>
        </thead>
        <tbody>
          @for (v of videos; track v.id) {
            <tr>
              <td>{{ v.dataEnvio ? (v.dataEnvio | date:'dd/MM/yyyy') : '-' }}</td>
              <td>{{ v.caminhoVideo || '-' }}</td>
              <td>{{ v.marcacoes || '-' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>

</div>
  */
})
export class JogadorFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  private lesoesSvc = inject(LesoesService);
  private videosSvc = inject(VideosService);

  mapTipo(t?: string | null) { const M: any = { M:'Muscular', L:'Ligamentar', O:'Óssea', C:'Contusão', N:'Neurológica' }; return t ? (M[t] ?? t) : '-'; }
  mapLocal(l?: string | null) { const M: any = { JL:'Joelho', TB:'Tíbia', CM:'Coxa/Posterior', OM:'Ombro', CT:'Costas', OT:'Outro' }; return l ? (M[l] ?? l) : '-'; }

  private svc = inject(JogadoresService);
  private clubesSvc = inject(ClubesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // Abas e modais
  activeTab: 'dados' | 'lesoes' | 'videos' = 'dados';
  showLesaoModal = false;
  showVideoModal = false;

  // Forms das modais
  lesaoForm = this.fb.group({
    descricao: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    dataOcorrencia: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    dataRecuperacao: this.fb.control<string | null>(null),
    tipoLesao: this.fb.control<string | null>(null),
    localCorpo: this.fb.control<string | null>(null),
    observacoes: this.fb.control<string | null>(null),
  });

  videoForm = this.fb.group({
    caminhoVideo: this.fb.control<string | null>(null),
    dataEnvio: this.fb.control<string | null>(null),
    marcacoes: this.fb.control<string | null>(null),
  });

  // Listas e staging
  lesoes: Lesao[] = [];
  videos: Video[] = [];
  stagedLesoes: LesaoUpsert[] = [];
  stagedVideos: VideoUpsert[] = [];
  // Preview imediato da foto selecionada
  previewFoto: string | null = null;
  private previewObjectUrl: string | null = null;

  openLesaoModal() { this.lesaoForm.reset({ descricao: '', dataOcorrencia: '' }); this.showLesaoModal = true; }
  openVideoModal() { this.videoForm.reset(); this.showVideoModal = true; }
  closeLesaoModal() { this.showLesaoModal = false; }
  closeVideoModal() { this.showVideoModal = false; }

  trackId(i: number, it: any) { return it?.id ?? i; }

  async uploadVideoFile(evt: Event) {
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
      this.videoForm.get('caminhoVideo')?.setValue(path);
      this.toast.success('Upload concluído');
    } catch {
      this.toast.error('Não foi possível enviar o arquivo');
    }
  }

  async uploadFotoFile(evt: Event) {
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
      const resp = await fetch('/api/Uploads/jogadores/foto', { method: 'POST', body: formData });
      if (!resp.ok) throw new Error('Falha no upload');
      const data = await resp.json();
      const path = data.path as string;
      this.form.get('foto')?.setValue(path);
      // após upload concluído, usar o caminho final
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
    // Em dev (ng serve 4200), se proxy n e3o pegar, aponta direto para o backend
    if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
      return 'http://127.0.0.1:5180' + path;
    }
    return path;
  }


  confirmAddLesao() {
    if (this.lesaoForm.invalid) return;
    const raw = this.lesaoForm.getRawValue();
    if (raw.dataRecuperacao && raw.dataRecuperacao < raw.dataOcorrencia) {
      this.toast.error('Data de recuperação não pode ser antes da ocorrência');
      return;
    }
    const staged: LesaoUpsert = {
      jogadorId: (this.id ?? 0) as any,
      descricao: raw.descricao!,
      dataOcorrencia: raw.dataOcorrencia!,
      dataRecuperacao: raw.dataRecuperacao ?? null,
      tipoLesao: raw.tipoLesao ?? null,
      localCorpo: raw.localCorpo ?? null,
      observacoes: raw.observacoes ?? null
    };
    this.stagedLesoes = [staged, ...this.stagedLesoes];
    this.toast.success('Lesão adicionada (será salva ao clicar em Salvar)');
    this.closeLesaoModal();
  }

  confirmAddVideo() {
    const raw = this.videoForm.getRawValue();
    const dataISO = raw.dataEnvio ? new Date(raw.dataEnvio as string).toISOString() : null;
    const staged: VideoUpsert = {
      jogadorId: (this.id ?? 0) as any,
      caminhoVideo: raw.caminhoVideo ?? null,
      dataEnvio: dataISO,
      marcacoes: raw.marcacoes ?? null
    };
    this.stagedVideos = [staged, ...this.stagedVideos];
    this.toast.success('Vídeo adicionado (será salvo ao clicar em Salvar)');
    this.closeVideoModal();
  }

  goBack() { const id = this.id; this.router.navigate(id ? ['/jogadores', id, 'perfil'] : ['/jogadores']); }

  removeStagedLesao(i: number) { this.stagedLesoes = this.stagedLesoes.filter((_, idx) => idx !== i); }
  removeStagedVideo(i: number) { this.stagedVideos = this.stagedVideos.filter((_, idx) => idx !== i); }

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
    altura: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(1), Validators.max(3)] }),
    peso: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(30), Validators.max(200)] }),
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
      this.svc.get(this.id).subscribe({ next: (j: Jogador) => {
        this.form.patchValue(j as any);
        // Carregar lesões e vídeos relacionados
        this.lesoesSvc.byJogador(this.id!).subscribe({ next: (ls) => this.lesoes = ls });
        this.videosSvc.byJogador(this.id!).subscribe({ next: (vs) => this.videos = vs });
      }});
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
    const persistAll = (jogadorId: number) => {
      const toCreateLesoes = this.stagedLesoes.map(s => ({ ...s, jogadorId }));
      const toCreateVideos = this.stagedVideos.map(s => ({ ...s, jogadorId }));
      const lesoes$ = toCreateLesoes.length ? forkJoin(toCreateLesoes.map(x => this.lesoesSvc.create(x))) : of([]);
      const videos$ = toCreateVideos.length ? forkJoin(toCreateVideos.map(x => this.videosSvc.create(x))) : of([]);
      forkJoin([lesoes$, videos$]).subscribe({ next: ([ls, vs]: any) => {
        const qtLes = Array.isArray(ls) ? ls.length : 0;
        const qtVid = Array.isArray(vs) ? vs.length : 0;
        // limpar staging após persistir
        this.stagedLesoes = [];
        this.stagedVideos = [];
        this.toast.success(`Jogador salvo. Lesões salvas: ${qtLes}. Vídeos salvos: ${qtVid}.`);
        this.router.navigate(['/jogadores', jogadorId, 'perfil']);
      }, error: () => {
        this.toast.error('Jogador salvo, mas houve falha ao salvar lesões/vídeos');
        this.router.navigate(['/jogadores', jogadorId, 'perfil']);
      }});
    };

    if (this.id) {
      this.svc.update(this.id, payload).subscribe({ next: () => {
        persistAll(this.id!);
      }, error: () => this.toast.error('Falha ao atualizar jogador'), complete: () => { this.saving = false; } });
    } else {
      this.svc.create(payload).subscribe({ next: (created) => {
        this.id = (created as any).id;
        persistAll(this.id!);
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

