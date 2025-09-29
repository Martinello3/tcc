import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JogadoresService } from '../../services/jogadores.service';
import { AvaliacoesService } from '../../services/avaliacoes.service';
import { ClubesService } from '../../services/clubes.service';
import { RelatoriosService } from '../../services/relatorios.service';
import { ToastService } from '../../services/toast.service';
import { JogadorFormComponent } from './jogador-form.component';
import type { Jogador } from '../../models/player';
import type { Avaliacao } from '../../models/avaliacao';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-perfil-jogador',
  standalone: true,
  imports: [CommonModule, RouterLink, JogadorFormComponent],
  styles: [`
  .header { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
  .avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; background: var(--bg-elev); border:1px solid var(--border); }
  .club-badge { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: var(--bg-elev); border:1px solid var(--border); }
  .actions { display:flex; gap:.5rem; flex-wrap: wrap; }
  .tabs { display:flex; gap:.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
  .tab { padding:.5rem .75rem; border-radius:.5rem .5rem 0 0; cursor:pointer; background: transparent; border: 1px solid transparent; }
  .tab.active { background: var(--bg-elev); border-color: var(--border); border-bottom-color: transparent; }
  .grid { display:grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 992px) { .grid { grid-template-columns: 1.6fr .8fr; } }
  .muted { color: var(--text-muted); }
  `],
  template: `
  <div class="container">
    <div class="mb-2">
      <a class="btn btn-sm btn-link" [routerLink]="['/jogadores']"><i class="bi bi-arrow-left"></i> Voltar</a>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <div class="header">
          <div class="d-flex align-items-center gap-3">
            <img class="avatar" [src]="imgSrc(jogador?.foto) || '/brand/user-placeholder.png'" alt="foto" />
            <div>
              <h2 class="m-0">{{ jogador?.nome || '-' }}</h2>
              <div class="d-flex align-items-center gap-2 muted small">
                <span>Idade: {{ idade(jogador?.dataNascimento) }}</span>
                <span>•</span>
                <span>Posição: {{ jogador?.posicao || '-' }}</span>
                <span>•</span>
                <span class="d-inline-flex align-items-center gap-2">
                  <img *ngIf="clubLogo" class="club-badge" [src]="imgSrc(clubLogo) || ''" alt="clube" />
                  <span>Clube: {{ jogador?.clubeAtual?.nome || '-' }}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="actions">
            @if (userId) {
              <button class="btn btn-sm" [ngClass]="isFavorito ? 'btn-success' : 'btn-outline-success'" (click)="onToggleFavorito()" [disabled]="favBusy">
                <i class="bi" [ngClass]="isFavorito ? 'bi-star-fill' : 'bi-star'"></i>
                <span class="ms-1">{{ isFavorito ? 'Favorito' : 'Favoritar' }}</span>
              </button>
            }
            <a class="btn btn-primary btn-sm" [routerLink]="['/avaliacoes', jogador?.id, 'novo']"><i class="bi bi-clipboard2-plus"></i> Nova Avaliação</a>
            <button class="btn btn-secondary btn-sm" (click)="onGerarRelatorio()" [disabled]="avaliacoes.length===0"><i class="bi bi-filetype-pdf"></i> Gerar Relatório</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" [class.active]="tab==='resumo'" (click)="tab='resumo'">Resumo</button>
      <button class="tab" [class.active]="tab==='historico'" (click)="tab='historico'">Histórico de Avaliações</button>
      <button class="tab" [class.active]="tab==='edicao'" (click)="tab='edicao'">Informações e Edição</button>
    </div>

    @if (tab==='resumo') {

    <div class="grid">
      <div class="d-flex flex-column gap-3">
        <div class="card">
          <div class="card-body">
            <h5 class="mb-3">Dados do Jogador</h5>
            <div class="row g-3">
              <div class="col-sm-6"><div class="muted small">Nacionalidade</div><div>{{ jogador?.nacionalidade || '-' }}</div></div>
              <div class="col-sm-6"><div class="muted small">Idade</div><div>{{ idade(jogador?.dataNascimento) }}</div></div>
              <div class="col-sm-6"><div class="muted small">Altura</div><div>{{ jogador?.altura || '-' }}</div></div>
              <div class="col-sm-6"><div class="muted small">Peso</div><div>{{ jogador?.peso || '-' }}</div></div>
              <div class="col-sm-6"><div class="muted small">Pé dominante</div><div>{{ jogador?.peDominante || '-' }}</div></div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h5 class="mb-3">Últimas Avaliações</h5>
            @if (avaliacoes.length === 0) {
              <div class="muted">Sem avaliações para este jogador.</div>
            } @else {
              <ul class="list-unstyled m-0">
                @for (a of avaliacoes.slice(0,3); track a.id) {
                  <li class="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <div>
                      <div class="fw-semibold">{{ a.data | date:'dd/MM/yyyy' }}</div>
                      <div class="muted small">Avaliador #{{ a.avaliadorId }}</div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge text-bg-dark border">Nota: {{ a.notaFinal ?? '-' }}</span>
                      <a class="btn btn-secondary btn-sm" [routerLink]="['/relatorios/avaliacao', jogador?.id, a.id]">Detalhes</a>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </div>
      <div class="d-flex flex-column gap-3">
        <div class="card">
          <div class="card-body">
            <h5 class="mb-3">Métricas rápidas</h5>
            <div class="row g-3">
              <div class="col-6">
                <div class="muted small">Avaliações</div>
                <div class="fs-4">{{ avaliacoes.length }}</div>
              </div>
              <div class="col-6">
                <div class="muted small">Média nota</div>
                <div class="fs-4">{{ mediaNota() }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h5 class="mb-3">Atalhos</h5>
            <div class="d-flex flex-column gap-2">
              <a class="btn btn-secondary" [routerLink]="['/avaliacoes', jogador?.id]">Ver histórico</a>
              <a class="btn btn-secondary" [routerLink]="['/jogadores', jogador?.id]">Editar informações</a>
            </div>
          </div>
        </div>
      </div>
      </div>

    }

    @if (tab==='historico') {
      <div class="card">
        <div class="card-body">
          <h5 class="mb-3">Histórico de Avaliações</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Local</th>
                  <th>Avaliador</th>
                  <th>Nota Geral</th>
                </tr>
              </thead>
              <tbody>
                @for (a of avaliacoes; track a.id) {
                  <tr class="row-click" (click)="goHistorico()">
                    <td>{{ a.data | date:'shortDate' }}</td>
                    <td>{{ localAval(a) }}</td>
                    <td>{{ avaliadorNome(a) }}</td>
                    <td>{{ notaGeral(a) }}</td>
                  </tr>
                }
                @if (!avaliacoes.length) {
                  <tr><td colspan="4" class="text-center muted">Sem avaliações</td></tr>
                }
              </tbody>
            </table>
          </div>
          <div class="text-end">
            <button class="btn btn-secondary" (click)="goHistorico()"><i class="bi bi-clock-history"></i> Abrir histórico completo</button>
          </div>
        </div>
      </div>
    }

    @if (tab==='edicao') {
      <app-jogador-form></app-jogador-form>
    }


  </div>
  `
})
export class PerfilJogadorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(JogadoresService);
  private router = inject(Router);
  private auth = inject(AuthService);

  jogador: Jogador | null = null;
  private aval = inject(AvaliacoesService);
  avaliacoes: Avaliacao[] = [];
  private clubes = inject(ClubesService);
  private rel = inject(RelatoriosService);
  private toast = inject(ToastService);

  clubLogo: string | null = null;
  tab: 'resumo' | 'historico' | 'edicao' = 'resumo';

  userId: number | null = null;
  isFavorito = false;
  favBusy = false;

  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? Number(idStr) : NaN;
    if (!id || isNaN(id)) {
      this.router.navigate(['/jogadores']);
      return;
    }
    this.userId = this.auth.user()?.id ?? null;
    this.api.get(id).subscribe({ next: (j) => { this.jogador = j; const cid = (j as any).clubeAtualId as number | null | undefined; if (cid) { this.clubes.get(cid).subscribe({ next: (c) => this.clubLogo = c.foto ?? null }); } if (this.userId) { this.api.favoritoStatus(id, this.userId).subscribe({ next: (r) => this.isFavorito = !!r?.favorite }); } }, error: () => this.router.navigate(['/jogadores']) });
    this.aval.byJogador(id).subscribe({ next: (list) => {
      this.avaliacoes = [...(list ?? [])].sort((a, b) => {
        const da = new Date((a as any).data).getTime() || 0;
        const db = new Date((b as any).data).getTime() || 0;
        return db - da;
      });
    }});
  }

  onToggleFavorito() {
    const jogadorId = this.jogador?.id;
    if (!jogadorId || !this.userId) return;
    this.favBusy = true;
    this.api.toggleFavorito(jogadorId, this.userId).subscribe({ next: (r) => { this.isFavorito = !!r?.favorite; this.favBusy = false; }, error: () => { this.favBusy = false; this.toast.error('Não foi possível atualizar favorito'); } });
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

  idade(dateISO?: string | null): string {
    if (!dateISO) return '-';
    const birth = new Date(dateISO);
    if (isNaN(birth.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  }

  mediaNota(): string {
    const vals = this.avaliacoes
      .map(a => (a.notaFinal ?? null))
      .filter((v): v is number => typeof v === 'number');
    if (vals.length === 0) return '-';
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    return avg.toFixed(1);
  }

  localAval(a: any): string { return a?.localAvaliacao || a?.local || '-'; }
  avaliadorNome(a: any): string { return a?.avaliadorNome || ('#' + (a?.avaliadorId ?? '-')); }
  notaGeral(a: any): string { const v = a?.notaGeral ?? a?.notaFinal; return (typeof v === 'number') ? String(v) : '-'; }


  goHistorico() {
    const id = this.jogador?.id;
    if (id) this.router.navigate(['/avaliacoes', id]);
  }

  onGerarRelatorio() {
    const ultima = this.avaliacoes?.[0] as any;
    const avaliacaoId = ultima?.id as number | undefined;
    const jogadorId = this.jogador?.id as number | undefined;
    if (!avaliacaoId || !jogadorId) { this.toast.info('Sem avaliações para gerar relatório'); return; }
    // Abrir o novo layout de relatório (mesmo usado no botão "Relatório")
    this.router.navigate(['/relatorios/avaliacao', jogadorId, avaliacaoId]);
  }

}


