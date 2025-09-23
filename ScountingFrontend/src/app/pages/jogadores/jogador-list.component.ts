import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import type { Jogador } from '../../models/player';
import { JogadoresFacade } from '../../facades/jogadores.facade';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { ClubesService } from '../../services/clubes.service';
import { AuthService } from '../../auth/auth.service';
import { JogadoresService } from '../../services/jogadores.service';
import { AvaliacoesService } from '../../services/avaliacoes.service';
import { RelatoriosService } from '../../services/relatorios.service';

@Component({
  selector: 'app-jogador-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1; }
    .search-group { width: 360px; }
    .search-input { height: 34px; padding-top: .25rem; padding-bottom: .25rem; }
    .input-group-text { height: 34px; padding-top: .25rem; padding-bottom: .25rem; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; background: var(--bg-elev); border: 1px solid var(--border); }
    .club-logo { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: var(--bg); border: 1px solid var(--border); }
    .row-click { cursor: pointer; }
    .row-click:hover { background-color: rgba(255,255,255,.06); }
    .nat-flag { font-size: 18px; line-height: 1; display: inline-block; width: 1.25em; text-align: center; }
    .flag-img { transition: all 0.2s ease; cursor: pointer; }
    .flag-img:hover { border: 1px solid var(--bs-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

    .player-cell { display: grid; grid-template-columns: 64px 1fr; column-gap: 24px; align-items: center; min-height: 64px; }
    .avatar-slot { grid-column: 1; justify-self: center; }
    .player-name { grid-column: 2; text-align: center; white-space: normal; word-break: break-word; }

    .colhead { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
    .col-ico { font-size: 22px; color: var(--bs-primary); line-height: 1; }
    .w-player { width: 32%; min-width: 320px; }
    .w-nac { width: 16%; }
    .w-age { width: 8%; }
    .w-pos { width: 16%; }
    .w-foot { width: 8%; }
    .w-club { width: 16%; }

    /* Novas colunas de insight */
    .w-rating { width: 12%; }
    .w-evals { width: 8%; }
    .w-last { width: 14%; }
    .rating-badge { border-radius: 999px; padding: .2rem .6rem; font-weight: 600; min-width: 46px; display: inline-block; }

    /* Ações rápidas */
    .w-actions { width: 16%; }
    .row-actions { opacity: 1; white-space: nowrap; }
    .wide-table { min-width: 1280px; }

  `],

  template: `
<div class="container">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <div>
      <h3 class="m-0"><i class="bi bi-people text-success"></i> Jogadores</h3>
      <small class="text-muted">Gerencie os jogadores cadastrados</small>
    </div>
    <div class="d-flex gap-2">
      <div class="input-group search-group">
        <span class="input-group-text py-0"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control search-input" placeholder="Buscar por nome" (input)="onFilter($any($event.target).value)" />
      </div>
      <a class="btn btn-success" [routerLink]="['/jogadores','novo']"><i class="bi bi-plus-lg"></i> Novo</a>
    </div>
  </div>

  <div class="card shadow-sm position-relative">
    @if (facade.loading()) {
      <div class="overlay">
        <div class="spinner-border text-success" role="status"></div>
      </div>
    }
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle mb-0 wide-table">
          @if (!facade.loading() && displayed().length === 0) {
            <caption class="text-center py-4 text-muted">Nenhum jogador encontrado</caption>
          }

          <thead>
            <tr>
              <th class="text-end w-actions">
                <div class="colhead"><i class="bi bi-lightning-charge col-ico"></i><div>Ações</div></div>
              </th>
              <th class="w-player">
                <div class="colhead"><i class="bi bi-person col-ico"></i><div>Jogador</div></div>
              </th>
              <th class="text-center w-rating">
                <div class="colhead"><i class="bi bi-star-fill col-ico"></i><div>Nota Geral</div></div>
              </th>
              <th class="text-center w-club">
                <div class="colhead"><i class="bi bi-shield-check col-ico"></i><div>Clube</div></div>
              </th>
              <th class="text-center w-nac">
                <div class="colhead"><i class="bi bi-globe col-ico"></i><div>Nacionalidade</div></div>
              </th>
              <th class="text-center w-age">
                <div class="colhead"><i class="bi bi-calendar-event col-ico"></i><div>Idade</div></div>
              </th>
              <th class="text-center w-pos">
                <div class="colhead"><i class="bi bi-geo-alt col-ico"></i><div>Posição</div></div>
              </th>
              <th class="text-center w-foot">
                <div class="colhead"><i class="bi bi-hand-thumbs-up col-ico"></i><div>Pé</div></div>
              </th>
            </tr>
          </thead>
          <tbody>
            @for (j of displayed(); track j.id) {
              <tr class="row-click" (click)="goTo(j.id)">
                <td class="text-end w-actions">
                  <div class="row-actions">
                    <button type="button" class="btn btn-outline-secondary btn-sm me-1"
                            (click)="onToggleFav(j, $event)"
                            [title]="isFav(j.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
                      <i class="bi" [ngClass]="isFav(j.id) ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm me-1"
                            (click)="onGerarRelatorio(j, $event)" title="Gerar relatório da última avaliação">
                      <i class="bi bi-filetype-pdf"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm"
                            (click)="onDelete(j); $event.stopPropagation()" title="Excluir jogador">
                      <i class="bi bi-trash text-danger"></i>
                    </button>
                  </div>
                </td>

                <td class="w-player">
                  <div class="player-cell">
                    <div class="avatar-slot">
                      <img class="avatar" [src]="imgSrc(j.foto) || '/brand/user-placeholder.png'" alt="foto" />
                    </div>
                    <div class="fw-semibold player-name">{{ j.nome }}</div>
                  </div>
                </td>
                <td class="text-center w-rating">
                  <span class="rating-badge" [ngClass]="ratingClass(j.notaGeral)">{{ j.notaGeral != null ? (j.notaGeral | number:'1.1-1') : '-' }}</span>
                </td>
                <td class="text-center w-club">
                  @if (clubesById.get(j.clubeAtualId || -1)?.foto) {
                    <img class="club-logo" [src]="imgSrc(clubesById.get(j.clubeAtualId || -1)?.foto || null)" alt="clube" />
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
                <td class="text-center w-nac align-middle">
                  <div class="d-flex align-items-center justify-content-center" style="min-height: 30px;">
                    @if (countryCodeFrom(j.nacionalidade) && !flagBroken.has(j.id)) {
                      <img [src]="flagUrl(countryCodeFrom(j.nacionalidade)!)" alt="flag" width="44" height="30"
                           class="flag-img" style="border-radius:2px" (error)="onFlagError(j.id)" />
                    } @else {
                      <i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i>
                    }
                  </div>
                </td>
                <td class="text-center w-age">{{ ageFrom(j.dataNascimento) }}</td>
                <td class="text-center w-pos">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-figure-walk text-primary"></i>
                    <span class="badge text-bg-dark border">{{ j.posicao || '-' }}</span>
                  </div>
                </td>
                <td class="text-center w-foot">
                  <span class="badge text-bg-dark border">{{ j.peDominante || '-' }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
  `
})
export class JogadorListComponent implements OnInit {
  facade = inject(JogadoresFacade);
  private router = inject(Router);
  private toast = inject(ToastService);
  private clubesSvc = inject(ClubesService);
  clubesById = new Map<number, { id: number; nome: string; foto?: string | null }>();


  flagBroken = new Set<number>();
  // Serviços para ações rápidas
  private auth = inject(AuthService);
  private jogSvc = inject(JogadoresService);
  private avalSvc = inject(AvaliacoesService);
  private relSvc = inject(RelatoriosService);

  // Estado de favoritos
  favoriteIds = signal<Set<number>>(new Set<number>());
  private userId: number | null = null;
  onFlagError(id: number) { this.flagBroken.add(id); }

  private dialog = inject(DialogService);

  jogadores = this.facade.items;
  query = this.facade.filter;
  displayed = this.facade.displayed;

  ngOnInit() {
    this.facade.load();
    // Carrega clubes para garantir nome mesmo que o jogador venha sem navegação
    this.clubesSvc.list().subscribe({ next: (res) => {
      res.forEach(c => this.clubesById.set(c.id, { id: c.id, nome: c.nome, foto: c.foto ?? null }));
    }});

    // Carrega favoritos do usuário logado (se houver)
    this.userId = this.auth.user()?.id ?? null;
    if (this.userId) {
      this.jogSvc.favoritos(this.userId).subscribe({ next: (arr) => {
        const set = new Set<number>((arr || []).map(j => j.id));
        this.favoriteIds.set(set);
      }});
    }
  }

  onFilter(value: string) {
    this.facade.setFilter(value);
  }

  async onDelete(j: Jogador) {
    const ok = await this.dialog.confirm(`Excluir jogador "${j.nome}"?`, { title: 'Confirmação', variant: 'danger', confirmText: 'Excluir' });
    if (!ok) return;
    this.facade.delete(j.id).subscribe({ next: () => {
      this.toast.success('Jogador excluído');
      this.facade.load();
    }, error: () => this.toast.error('Falha ao excluir jogador') });
  }

  goTo(id: number) {
    this.router.navigate(['/jogadores', id, 'perfil']);
  }

  ageFrom(dateISO?: string | null): string {
    if (!dateISO) return '-';
    const birth = new Date(dateISO);
    if (isNaN(birth.getTime())) return '-';


    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  }

  ratingClass(n?: number | null) {
    if (n == null) return { 'text-bg-secondary': true } as any;
    if (n >= 8.0) return { 'bg-success': true, 'text-white': true } as any;
    if (n >= 6.5) return { 'bg-warning': true, 'text-dark': true } as any;
    return { 'bg-danger': true, 'text-white': true } as any;
  }

  isFav(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  onToggleFav(j: Jogador, ev: MouseEvent) {
    ev.stopPropagation();
    if (!this.userId) { this.toast.error('É necessário estar logado para favoritar'); return; }
    this.jogSvc.toggleFavorito(j.id, this.userId).subscribe({ next: (r) => {
      const set = new Set(this.favoriteIds());
      if (r.favorite) set.add(j.id); else set.delete(j.id);
      this.favoriteIds.set(set);
      this.toast.success(r.favorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    }, error: () => this.toast.error('Não foi possível atualizar favorito') });
  }

  onGerarRelatorio(j: Jogador, ev: MouseEvent) {
    ev.stopPropagation();
    this.avalSvc.byJogador(j.id).subscribe({ next: (list) => {
      const arr = (list || []).slice().sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());
      if (arr.length === 0) { this.toast.info('Jogador não possui avaliações'); return; }
      const last = arr[0] as any;
      const avaliacaoId = last?.id as number | undefined;
      if (!avaliacaoId) { this.toast.error('Não foi possível identificar a última avaliação'); return; }
      // Abre a mesma página/layou de relatório usada no perfil do jogador
      this.router.navigate(['/relatorios/avaliacao', j.id, avaliacaoId]);
    }, error: () => this.toast.error('Falha ao obter avaliações do jogador') });
  }

  formatUltimaAvaliacao(dateISO?: string | null): string {
    if (!dateISO) return 'Nunca avaliado';
    const d = new Date(dateISO);
    if (isNaN(d.getTime())) return 'Nunca avaliado';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 30) return `há ${days} dia${days === 1 ? '' : 's'}`;
    return this.formatDateBR(d);
  }

  private formatDateBR(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }


  countryCodeFrom(n?: string | null): string | null {
    if (!n) return null;
    const map: Record<string, string> = {
      'Brasileiro': 'br', 'Argentino': 'ar', 'Uruguaio': 'uy', 'Paraguaio': 'py', 'Chileno': 'cl',
      'Colombiano': 'co', 'Peruano': 'pe', 'Boliviano': 'bo', 'Equatoriano': 'ec', 'Venezuelano': 've',
      'Português': 'pt', 'Espanhol': 'es', 'Francês': 'fr', 'Italiano': 'it', 'Alemão': 'de',
      'Inglês': 'gb', 'Holandês': 'nl', 'Belga': 'be', 'Suíço': 'ch', 'Austríaco': 'at',
      'Americano': 'us', 'Mexicano': 'mx', 'Canadense': 'ca', 'Japonês': 'jp', 'Coreano': 'kr', 'Chinês': 'cn'
    };
    return map[n] ?? null;
  }

  flagUrl(code: string): string {
    // Usa os arquivos locais em public/flags (servidos como /flags)
    return `/flags/${code}.svg`;
  }


  positionIcon(pos?: string | null): string {
    const p = (pos || '').toLowerCase();
    if (p.includes('goleiro')) return 'bi-shield';
    if (p.includes('zagueiro')) return 'bi-shield';
    if (p.includes('lateral')) return 'bi-arrow-left-right';
    if (p.includes('volante')) return 'bi-diagram-3';
    if (p.includes('meia')) return 'bi-grid-3x3-gap';
    if (p.includes('ponta')) return 'bi-wind';
    if (p.includes('atacante')) return 'bi-bullseye';
    return 'bi-person';
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

  flagFrom(n?: string | null): string {
    if (!n) return '';
    const M: Record<string, string> = {
      'Brasileiro': '🇧🇷', 'Argentino': '🇦🇷', 'Uruguaio': '🇺🇾', 'Paraguaio': '🇵🇾', 'Chileno': '🇨🇱',
      'Colombiano': '🇨🇴', 'Peruano': '🇵🇪', 'Boliviano': '🇧🇴', 'Equatoriano': '🇪🇨', 'Venezuelano': '🇻🇪',
      'Português': '🇵🇹', 'Espanhol': '🇪🇸', 'Francês': '🇫🇷', 'Italiano': '🇮🇹', 'Alemão': '🇩🇪',
      'Inglês': '🇬🇧', 'Holandês': '🇳🇱', 'Belga': '🇧🇪', 'Suíço': '🇨🇭', 'Austríaco': '🇦🇹',
      'Americano': '🇺🇸', 'Mexicano': '🇲🇽', 'Canadense': '🇨🇦', 'Japonês': '🇯🇵', 'Coreano': '🇰🇷', 'Chinês': '🇨🇳'
    };
    return M[n] ?? '';
  }

}

