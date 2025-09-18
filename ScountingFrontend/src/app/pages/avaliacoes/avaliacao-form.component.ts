import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvaliacoesService } from '../../services/avaliacoes.service';

import { JogadoresService } from '../../services/jogadores.service';
import type { Jogador } from '../../models/player';

@Component({
  standalone: true,
  selector: 'app-avaliacao-form',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="container">
    <div class="card shadow-sm sticky-top mb-3" style="top: 0; z-index: 1020;">
      <div class="card-body d-flex align-items-center gap-3">
        <a class="btn btn-sm btn-link" [routerLink]="['/jogadores', jogadorId, 'perfil']"><i class="bi bi-arrow-left"></i> Voltar</a>
        <img *ngIf="jogador()?.foto" [src]="imgSrc(jogador()?.foto)" alt="foto" class="rounded" style="width:48px;height:48px;object-fit:cover" />
        <div>
          <div class="fw-semibold">Nova Avaliação — {{ jogador()?.nome || '-' }}</div>
          <div class="small text-muted">Posição: {{ jogador()?.posicao || '-' }} • Clube: {{ jogador()?.clubeAtual?.nome || '-' }}</div>
        </div>
        <div class="ms-auto">
          <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/jogadores', jogadorId, 'perfil']">Ver perfil</a>
        </div>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()" class="card shadow-sm">
      <div class="card-header bg-white">
        <div class="nav nav-tabs card-header-tabs" role="tablist">
          <button class="nav-link" [class.active]="tab==='ger'" (click)="tab='ger'" type="button">Dados Gerais</button>
          <button class="nav-link" [class.active]="tab==='fis'" (click)="tab='fis'" type="button">Aval. Física</button>
          <button class="nav-link" [class.active]="tab==='tec'" (click)="tab='tec'" type="button">Aval. Técnica</button>
          <button class="nav-link" [class.active]="tab==='tat'" (click)="tab='tat'" type="button">Aval. Tático/Comport.</button>
        </div>
      </div>

      <div class="card-body">
        <div *ngIf="validation.geral?.length" class="alert alert-danger py-2">
          <div class="fw-semibold mb-1">Corrija os campos destacados:</div>
          <ul class="m-0 ps-3">
            <li *ngFor="let msg of validation.geral">{{ msg }}</li>
          </ul>
        </div>
        <div *ngIf="submitStatus==='success'" class="alert alert-success py-2">{{ submitMessage || 'Avaliação enviada com sucesso.' }}</div>
        <div *ngIf="submitStatus==='error'" class="alert alert-danger py-2">{{ submitMessage || 'Erro ao enviar avaliação. Tente novamente.' }}</div>

        <!-- DADOS GERAIS -->
        <div [hidden]="tab!=='ger'">
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label class="form-label">Data da Avaliação</label>
              <input type="datetime-local" class="form-control" [(ngModel)]="form.dados_avaliacao.data_avaliacao" name="dados_avaliacao_data">
            </div>
            <div class="col-12 col-md-8">
              <label class="form-label">Local da Avaliação</label>
              <input type="text" class="form-control" [(ngModel)]="form.dados_avaliacao.local_avaliacao" name="dados_avaliacao_local" placeholder="Ex.: Estádio Municipal, Centro de Treinamento...">
            </div>
            <div class="col-12">
              <label class="form-label">Comentários Gerais</label>
              <textarea class="form-control" rows="3" [(ngModel)]="form.dados_avaliacao.comentarios_gerais" name="dados_avaliacao_comentarios" placeholder="Observações gerais, comportamentais, cabeçalho/movimentação/versatilidade, composição corporal, etc."></textarea>
            </div>
          </div>
          <div class="alert alert-light border mt-3 d-flex align-items-center justify-content-between">
            <div>
              <div class="small text-muted">Nota Final (atualiza automaticamente)</div>
              <div class="display-6 m-0">{{ notaFinal() | number:'1.0-2' }}</div>
            </div>
            <div class="text-end small">
              <div><strong>Técnica:</strong> {{ scoreTecnica() | number:'1.0-2' }}</div>
              <div><strong>Tática:</strong> {{ scoreTatica() | number:'1.0-2' }}</div>
              <div><strong>Psico:</strong> {{ scorePsico() | number:'1.0-2' }}</div>
            </div>
          </div>
        </div>

        <!-- FISICA -->
        <div [hidden]="tab!=='fis'">
          <div class="row g-3">
            <div class="col-12 d-flex align-items-center justify-content-between mt-2">
              <div class="fw-semibold">Testes Físicos Realizados</div>
              <button type="button" class="btn btn-sm btn-success" (click)="addTesteFisico()">[+ Adicionar Teste Físico]</button>
            </div>
            <div class="col-12 text-muted fst-italic small" *ngIf="!(form.dados_avaliacao?.fisica?.length)">Nenhum teste físico adicionado</div>
            <div class="col-12" *ngFor="let t of form.dados_avaliacao.fisica; let i = index">
              <div class="row g-2 align-items-end">
                <div class="col-12 col-md-3">
                  <label class="form-label">Tipo de Teste</label>
                  <select class="form-select" [(ngModel)]="t.tipo_teste" name="tipoTeste_{{i}}" (ngModelChange)="onTipoTesteChange(i)" [class.is-invalid]="validation.fisica[i]?.tipo_teste">
                    <option value="">Selecione...</option>
                    <option *ngFor="let k of fisicaTipos" [value]="k">{{ k }}</option>
                  </select>
                  <div class="invalid-feedback">Informe o tipo de teste.</div>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label">Teste</label>
                  <select class="form-select" [(ngModel)]="t.teste" name="testeNome_{{i}}" (ngModelChange)="onTesteChange(i)" [disabled]="!t.tipo_teste" [class.is-invalid]="validation.fisica[i]?.teste">
                    <option value="">Selecione...</option>
                    <option *ngFor="let opt of testesPorTipo(t.tipo_teste)" [value]="opt.nome">{{ opt.nome }}</option>
                  </select>
                  <div class="invalid-feedback">Informe o teste.</div>
                </div>
                <div class="col-6 col-md-2">
                  <label class="form-label">Resultado</label>
                  <input type="text" class="form-control" [(ngModel)]="t.resultado" name="testeResultado_{{i}}" [disabled]="!t.teste" [class.is-invalid]="validation.fisica[i]?.resultado">
                  <div class="invalid-feedback">Informe o resultado.</div>
                </div>
                <div class="col-6 col-md-2">
                  <label class="form-label">Unidade</label>
                  <input type="text" class="form-control" [(ngModel)]="t.unidade" name="testeUnidade_{{i}}" [disabled]="true" [class.is-invalid]="validation.fisica[i]?.unidade">
                  <div class="invalid-feedback">Informe a unidade.</div>
                </div>
                <div class="col-12 col-md-1 text-end">
                  <button type="button" class="btn btn-outline-danger" (click)="removeTesteFisico(i)"><i class="bi bi-x-lg"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TECNICA -->
        <div [hidden]="tab!=='tec'">
          <div class="row g-3">
            <div class="col-12 d-flex align-items-center justify-content-between mt-2">
              <div class="fw-semibold">Exercícios Técnicos Realizados</div>
              <button type="button" class="btn btn-sm btn-success" (click)="addExercicioTecnico()">[+ Adicionar Exercício Técnico]</button>
            </div>
            <div class="col-12 text-muted fst-italic small" *ngIf="!(form.dados_avaliacao?.tecnica?.length)">Nenhum exercício técnico adicionado</div>
            <div class="col-12" *ngFor="let e of form.dados_avaliacao.tecnica; let i = index">
              <div class="row g-2 align-items-end">
                <div class="col-12 col-md-3">
                  <label class="form-label">Tipo de Exercício</label>
                  <select class="form-select" [(ngModel)]="e.tipo_exercicio" name="tecTipo_{{i}}" (ngModelChange)="onTipoExercicioChange(i)" [class.is-invalid]="validation.tecnica[i]?.tipo_exercicio">
                    <option value="">Selecione...</option>
                    <option *ngFor="let k of tecnicaTipos" [value]="k">{{ k }}</option>
                  </select>
                  <div class="invalid-feedback">Informe o tipo.</div>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label">Exercício</label>
                  <select class="form-select" [(ngModel)]="e.exercicio" name="tecExercicio_{{i}}" (ngModelChange)="onExercicioTecnicoChange(i)" [disabled]="!e.tipo_exercicio" [class.is-invalid]="validation.tecnica[i]?.exercicio">
                    <option value="">Selecione...</option>
                    <option *ngFor="let opt of exerciciosPorTipo(e.tipo_exercicio)" [value]="opt.nome">{{ opt.nome }}</option>
                  </select>
                  <div class="invalid-feedback">Informe o exercício.</div>
                </div>
                <div class="col-6 col-md-2">
                  <label class="form-label">Acertos</label>
                  <input type="number" class="form-control" min="0" [(ngModel)]="e.acertos" name="tecAcertos_{{i}}" [disabled]="!e.exercicio" [class.is-invalid]="validation.tecnica[i]?.acertos">
                  <div class="invalid-feedback">Informe os acertos.</div>
                </div>
                <div class="col-6 col-md-2">
                  <label class="form-label">Tentativas</label>
                  <input type="number" class="form-control" min="0" [(ngModel)]="e.tentativas" name="tecTentativas_{{i}}" [disabled]="!e.exercicio" [class.is-invalid]="validation.tecnica[i]?.tentativas">
                  <div class="invalid-feedback">Informe as tentativas.</div>
                </div>
                <div class="col-12 col-md-1 text-end">
                  <button type="button" class="btn btn-outline-danger" (click)="removeExercicioTecnico(i)"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="col-12">
                  <label class="form-label">Observações</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="e.observacoes" name="tecObs_{{i}}" [disabled]="!e.exercicio"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TATICA & COMPORTAMENTAL -->
        <div [hidden]="tab!=='tat'">
          <div class="row g-3">
            <!-- Posicionamento -->
            <div class="col-12">
              <div class="row align-items-center g-2">
                <div class="col-12 col-md-4"><label class="form-label m-0">Posicionamento</label></div>
                <div class="col">
                  <input type="range" class="form-range" min="1" max="10" step="1"
                         [(ngModel)]="form.dados_avaliacao.tatica_comportamental.posicionamento" name="tat_posicionamento">
                </div>
                <div class="col-auto"><span class="badge bg-secondary">{{ form.dados_avaliacao?.tatica_comportamental?.posicionamento || 0 }}/10</span></div>
              </div>
            </div>
            <!-- Leitura de Jogo -->
            <div class="col-12">
              <div class="row align-items-center g-2">
                <div class="col-12 col-md-4"><label class="form-label m-0">Leitura de Jogo</label></div>
                <div class="col">
                  <input type="range" class="form-range" min="1" max="10" step="1"
                         [(ngModel)]="form.dados_avaliacao.tatica_comportamental.leitura_jogo" name="tat_leitura_jogo">
                </div>
                <div class="col-auto"><span class="badge bg-secondary">{{ form.dados_avaliacao?.tatica_comportamental?.leitura_jogo || 0 }}/10</span></div>
              </div>
            </div>
            <!-- Tomada de Decisão -->
            <div class="col-12">
              <div class="row align-items-center g-2">
                <div class="col-12 col-md-4"><label class="form-label m-0">Tomada de Decisão</label></div>
                <div class="col">
                  <input type="range" class="form-range" min="1" max="10" step="1"
                         [(ngModel)]="form.dados_avaliacao.tatica_comportamental.tomada_decisao" name="tat_tomada_decisao">
                </div>
                <div class="col-auto"><span class="badge bg-secondary">{{ form.dados_avaliacao?.tatica_comportamental?.tomada_decisao || 0 }}/10</span></div>
              </div>
            </div>
          </div>
        </div>




      </div>

      <div class="card-footer d-flex justify-content-between align-items-center gap-2 bg-white">
        <div class="ms-auto d-flex gap-2">
          <a class="btn btn-outline-secondary" [routerLink]="['/jogadores', jogadorId, 'perfil']">Cancelar</a>
          <button class="btn btn-success" type="submit" [disabled]="submitting">
            <span class="spinner-border spinner-border-sm me-1" *ngIf="submitting"></span>
            <i class="bi bi-check2"></i> Finalizar Avaliação
          </button>
        </div>
      </div>
    </form>
  </div>
  `
})
export class AvaliacaoFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(AvaliacoesService);

  private jogadoresSvc = inject(JogadoresService);

  jogadorId = Number(this.route.snapshot.paramMap.get('jogadorId'));
  jogador = signal<Jogador | null>(null);
  tab: 'ger' | 'fis' | 'tec' | 'tat' = 'ger';

  // estado de submissão/validação
  submitting = false;
  submitStatus: 'idle' | 'success' | 'error' = 'idle';
  submitMessage = '';
  validation: { geral: string[]; fisica: Array<any>; tecnica: Array<any> } = { geral: [], fisica: [], tecnica: [] };

  constructor() {
    if (this.jogadorId) {
      this.jogadoresSvc.get(this.jogadorId).subscribe({ next: j => this.jogador.set(j) });
    }
  }

  imgSrc(val?: string | null): string | null {
    if (!val) return null;
    if (val.startsWith('blob:') || val.startsWith('data:') || /^https?:\/\//.test(val)) return val;
    const path = val.startsWith('/') ? val : '/' + val;
    if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
      return 'http://127.0.0.1:5180' + path;
    }
    return path;
  }


  form: any = {
    // dados gerais (novo schema)
    dados_avaliacao: {
      data_avaliacao: new Date().toISOString().slice(0,16),
      local_avaliacao: '',
      comentarios_gerais: '',
      fisica: [] as any[],
      tecnica: [] as any[],
      tatica_comportamental: {
        posicionamento: null,
        leitura_jogo: null,
        tomada_decisao: null
      }
    },

    // tecnica (novo schema via dados_avaliacao.tecnica)
    // tatica (novo schema via dados_avaliacao.tatica_comportamental)
    // psico
    disciplina: null,
    lideranca: null,
    proatividade: null,
    inteligenciaEmocional: null
  };

  private avg = (vals: Array<number | null | string>) => {
    const xs = vals.filter((v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)));
    if (xs.length === 0) return 0;
    const nums = xs.map(v => Number(v));
    const sum = nums.reduce((a, b) => a + b, 0);
    return sum / nums.length;
  };

  scoreTecnica = computed(() => 0);
  scoreTatica = computed(() => this.avg([
    this.form.dados_avaliacao?.tatica_comportamental?.posicionamento,
    this.form.dados_avaliacao?.tatica_comportamental?.leitura_jogo,
    this.form.dados_avaliacao?.tatica_comportamental?.tomada_decisao
  ]));
  scoreFisica = computed(() => 0);
  scorePsico = computed(() => this.avg([this.form.disciplina, this.form.lideranca, this.form.proatividade, this.form.inteligenciaEmocional]));

  notaFinal = computed(() => {
    const t = this.scoreTecnica();
    const ta = this.scoreTatica();
    const f = this.scoreFisica();
    const p = this.scorePsico();
    const nota = t * 0.35 + ta * 0.25 + f * 0.25 + p * 0.15;
    return Math.round(nota * 100) / 100;
  });

  canSubmit = computed(() => {
    const v = this.form;
    const hasDadosGerais = Boolean(v.dados_avaliacao?.data_avaliacao || v.dados_avaliacao?.local_avaliacao || v.dados_avaliacao?.comentarios_gerais);
    const hasFisLinhas = Array.isArray(v.dados_avaliacao?.fisica) && v.dados_avaliacao.fisica.some((t: any) => (t?.teste && String(t.teste).trim() !== '') || (t?.resultado && String(t.resultado).trim() !== '') || (t?.unidade && String(t.unidade).trim() !== ''));
    const hasTecLinhas = Array.isArray(v.dados_avaliacao?.tecnica) && v.dados_avaliacao.tecnica.some((e: any) => (e?.exercicio && String(e.exercicio).trim() !== '') || e?.acertos !== null || e?.tentativas !== null || (e?.observacoes && String(e.observacoes).trim() !== ''));
    const tc = v.dados_avaliacao?.tatica_comportamental;
    const hasTatVals = !!tc && [tc.posicionamento, tc.leitura_jogo, tc.tomada_decisao].some(x => x !== null && x !== undefined && x !== '' && !isNaN(Number(x)));
    return hasDadosGerais || hasFisLinhas || hasTecLinhas || hasTatVals;
  });

  addTesteFisico() {
    if (!this.form.dados_avaliacao) this.form.dados_avaliacao = { fisica: [] } as any;
    if (!Array.isArray(this.form.dados_avaliacao.fisica)) this.form.dados_avaliacao.fisica = [];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    this.form.dados_avaliacao.fisica.push({ id_temp: id, tipo_teste: '', teste: '', resultado: '', unidade: '' });
  }
  removeTesteFisico(i: number) {
    if (Array.isArray(this.form.dados_avaliacao?.fisica)) this.form.dados_avaliacao.fisica.splice(i, 1);
  }

  addExercicioTecnico() {
    if (!this.form.dados_avaliacao) this.form.dados_avaliacao = { tecnica: [] } as any;
    if (!Array.isArray(this.form.dados_avaliacao.tecnica)) this.form.dados_avaliacao.tecnica = [];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    this.form.dados_avaliacao.tecnica.push({ id_temp: id, tipo_exercicio: '', exercicio: '', acertos: null, tentativas: null, observacoes: '' });
  }
  removeExercicioTecnico(i: number) {
    if (Array.isArray(this.form.dados_avaliacao?.tecnica)) this.form.dados_avaliacao.tecnica.splice(i, 1);
  }

  // Catálogo de testes físicos por categoria
  fisicaCatalog = {
    "Resistência": [
      { nome: "Yo-Yo Intermittent Recovery Test (IR1)", unidade_padrao: "Nível" },
      { nome: "Yo-Yo Intermittent Recovery Test (IR2)", unidade_padrao: "Nível" },
      { nome: "Teste de Cooper (12 minutos)", unidade_padrao: "Metros (m)" },
      { nome: "Teste T-CAR (Navete)", unidade_padrao: "Repetições" },
      { nome: "Teste de 1600 metros", unidade_padrao: "Minutos (min)" }
    ],
    "Velocidade": [
      { nome: "Sprint de 5 metros", unidade_padrao: "Segundos (s)" },
      { nome: "Sprint de 10 metros", unidade_padrao: "Segundos (s)" },
      { nome: "Sprint de 20 metros", unidade_padrao: "Segundos (s)" },
      { nome: "Sprint de 30 metros", unidade_padrao: "Segundos (s)" },
      { nome: "RAST (Running Anaerobic Sprint Test)", unidade_padrao: "Segundos (s)" },
      { nome: "Velocidade Máxima (GPS)", unidade_padrao: "Quilômetros por Hora (km/h)" }
    ],
    "Agilidade": [
      { nome: "Teste T", unidade_padrao: "Segundos (s)" },
      { nome: "Illinois Agility Test", unidade_padrao: "Segundos (s)" },
      { nome: "Shuttle Run (Pro-Agility 5-10-5)", unidade_padrao: "Segundos (s)" },
      { nome: "Teste de Zigue-Zague", unidade_padrao: "Segundos (s)" }
    ],
    "Força e Potência": [
      { nome: "Salto Vertical (CMJ)", unidade_padrao: "Centímetros (cm)" },
      { nome: "Salto Horizontal", unidade_padrao: "Metros (m)" },
      { nome: "Teste de Flexões de Braço", unidade_padrao: "Repetições" },
      { nome: "Teste de Prancha (Plank)", unidade_padrao: "Segundos (s)" },
      { nome: "Arremesso de Medicine Ball", unidade_padrao: "Metros (m)" },
      { nome: "Teste de Abdominais (1 minuto)", unidade_padrao: "Repetições" }
    ],
    "Flexibilidade": [
      { nome: "Teste de Sentar e Alcançar", unidade_padrao: "Centímetros (cm)" },
      { nome: "Teste de Mobilidade do Tornozelo", unidade_padrao: "Centímetros (cm)" }
    ]
  } as const;

  get fisicaTipos(): string[] { return Object.keys(this.fisicaCatalog); }

  testesPorTipo(tipo?: string) {
    return (tipo && (this.fisicaCatalog as any)[tipo]) || [];
  }

  onTipoTesteChange(i: number) {
    const t = this.form.dados_avaliacao?.fisica?.[i];
    if (!t) return;
    t.teste = '';
    t.resultado = '';
    t.unidade = '';
  }

  onTesteChange(i: number) {
    const t = this.form.dados_avaliacao?.fisica?.[i];
    if (!t) return;
    const opts = this.testesPorTipo(t.tipo_teste);
    const found = opts.find((o: any) => o.nome === t.teste);
    t.unidade = found?.unidade_padrao || '';
  }

  // Catálogo de exercícios técnicos por categoria
  tecnicaCatalog = {
    "Passe e Controle": [
      { nome: "Passe curto (chapada)" },
      { nome: "Passe longo (virada de jogo)" },
      { nome: "Passe de primeira" },
      { nome: "Recepção/Domínio de bola rasteira" },
      { nome: "Recepção/Domínio de bola aérea" },
      { nome: "Controle orientado (domínio já saindo da marcação)" }
    ],
    "Condução e Drible": [
      { nome: "Condução de bola em velocidade" },
      { nome: "Condução de bola sob pressão" },
      { nome: "Drible em situação de 1 contra 1 (ofensivo)" },
      { nome: "Proteção de bola (giro e pivô)" }
    ],
    "Finalização": [
      { nome: "Finalização de dentro da área (bola rolando)" },
      { nome: "Finalização de primeira (cruzamentos)" },
      { nome: "Finalização de fora da área" },
      { nome: "Cobrança de pênalti" },
      { nome: "Cobrança de falta frontal" },
      { nome: "Cabeceio ofensivo" }
    ],
    "Ações Defensivas": [
      { nome: "Desarme em pé (bote)" },
      { nome: "Carrinho (desarme no chão)" },
      { nome: "Interceptação/Leitura de passes" },
      { nome: "Cabeceio defensivo (bola parada)" },
      { nome: "Rebatida/Aliviar o perigo" }
    ],
    "Cruzamentos e Jogo Aéreo": [
      { nome: "Cruzamento da linha de fundo (bola rolando)" },
      { nome: "Cruzamento de intermediária (bola parada)" },
      { nome: "Cobrança de escanteio" }
    ]
  } as const;

  get tecnicaTipos(): string[] { return Object.keys(this.tecnicaCatalog); }

  exerciciosPorTipo(tipo?: string) {
    return (tipo && (this.tecnicaCatalog as any)[tipo]) || [];
  }

  onTipoExercicioChange(i: number) {
    const e = this.form.dados_avaliacao?.tecnica?.[i];
    if (!e) return;
    e.exercicio = '';
    e.acertos = null as any;
    e.tentativas = null as any;
    e.observacoes = '';
  }

  onExercicioTecnicoChange(i: number) {
    // Mantemos para eventuais resets futuros; atualmente apenas garante a habilitação dos campos.
    const e = this.form.dados_avaliacao?.tecnica?.[i];
    if (!e) return;
  }


  onSubmit() {
    this.submitStatus = 'idle';
    this.submitMessage = '';
    this.validation = { geral: [], fisica: [], tecnica: [] };

    const da = this.form?.dados_avaliacao || {};
    const fis: any[] = Array.isArray(da.fisica) ? da.fisica : [];
    const tec: any[] = Array.isArray(da.tecnica) ? da.tecnica : [];

    // validação geral
    const dataVal = da.data_avaliacao;
    const localVal = (da.local_avaliacao || '').trim();
    if (!dataVal) this.validation.geral.push('Data da avaliação é obrigatória.');
    if (!localVal) this.validation.geral.push('Local da avaliação é obrigatório.');

    // validação itens físicos (teste, resultado, unidade obrigatórios)
    let fisErr = false;
    this.validation.fisica = fis.map(_ => ({}));
    fis.forEach((t, i) => {
      const teste = (t?.teste || '').trim();
      const resultado = (t?.resultado || '').trim();
      const unidade = (t?.unidade || '').trim();
      if (!teste) { this.validation.fisica[i].teste = true; fisErr = true; }
      if (!resultado) { this.validation.fisica[i].resultado = true; fisErr = true; }
      if (!unidade) { this.validation.fisica[i].unidade = true; fisErr = true; }
    });
    if (fisErr) this.validation.geral.push('Preencha todos os campos obrigatórios nos Testes Físicos.');

    // validação itens técnicos (exercicio, acertos, tentativas obrigatórios)
    let tecErr = false;
    this.validation.tecnica = tec.map(_ => ({}));
    tec.forEach((e, i) => {
      const tipo = (e?.tipo_exercicio || '').trim();
      const exercicio = (e?.exercicio || '').trim();
      const acertos = e?.acertos;
      const tentativas = e?.tentativas;
      if (!tipo) { this.validation.tecnica[i].tipo_exercicio = true; tecErr = true; }
      if (!exercicio) { this.validation.tecnica[i].exercicio = true; tecErr = true; }
      if (acertos === null || acertos === undefined || acertos === '') { this.validation.tecnica[i].acertos = true; tecErr = true; }
      if (tentativas === null || tentativas === undefined || tentativas === '') { this.validation.tecnica[i].tentativas = true; tecErr = true; }
    });
    if (tecErr) this.validation.geral.push('Preencha todos os campos obrigatórios nos Exercícios Técnicos.');

    if (this.validation.geral.length) {
      // aborta envio e destaca campos
      return;
    }

    // monta payload limpo (sem id_temp)
    const clean = {
      data_avaliacao: dataVal,
      local_avaliacao: localVal,
      comentarios_gerais: (da.comentarios_gerais || '').trim(),
      fisica: fis.map(t => ({
        tipo_teste: String((t?.tipo_teste || '').trim()),
        teste: String((t?.teste || '').trim()),
        resultado: String((t?.resultado || '').trim()),
        unidade: String((t?.unidade || '').trim()),
        ...(t?.observacoes && String(t.observacoes).trim() ? { observacoes: String(t.observacoes).trim() } : {})
      })),
      tecnica: tec.map(e => ({
        tipo_exercicio: String((e?.tipo_exercicio || '').trim()),
        exercicio: String((e?.exercicio || '').trim()),
        acertos: Number(e?.acertos ?? 0),
        tentativas: Number(e?.tentativas ?? 0),
        ...(e?.observacoes && String(e.observacoes).trim() ? { observacoes: String(e.observacoes).trim() } : {})
      })),
      tatica_comportamental: {
        posicionamento: da?.tatica_comportamental?.posicionamento ?? null,
        leitura_jogo: da?.tatica_comportamental?.leitura_jogo ?? null,
        tomada_decisao: da?.tatica_comportamental?.tomada_decisao ?? null
      }
    } as const;

    this.submitting = true;
    this.svc.createForJogador(this.jogadorId, clean).subscribe({
      next: _ => {
        this.submitting = false;
        this.submitStatus = 'success';
        this.submitMessage = 'Avaliação enviada com sucesso.';
        this.router.navigate(['/jogadores', this.jogadorId, 'perfil']);
      },
      error: _ => {
        this.submitting = false;
        this.submitStatus = 'error';
        this.submitMessage = 'Erro ao enviar avaliação. Tente novamente.';
      }
    });
  }
}

