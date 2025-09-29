import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { Clube } from '../../models/club';
import { ClubesFacade } from '../../facades/clubes.facade';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-club-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1; }
    .search-group { width: 360px; }
    .search-input { height: 34px; padding-top: .25rem; padding-bottom: .25rem; }
    .input-group-text { height: 34px; padding-top: .25rem; padding-bottom: .25rem; }
    .colhead { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
    .col-ico { font-size: 22px; color: var(--bs-primary); line-height: 1; }
    .flag-img { transition: .2s; cursor: pointer; }
    .flag-img:hover { border: 1px solid var(--bs-primary); box-shadow: 0 2px 4px rgba(0,0,0,.1); }
    .club-logo { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: #fff; border: 1px solid rgba(0,0,0,.08); }

    /* Nome com logo fixo e nome centralizado, afastado do logo */
    .club-cell { display: grid; grid-template-columns: 56px 1fr 56px; column-gap: 40px; align-items: center; min-height: 56px; }
    .logo-slot { grid-column: 1; justify-self: center; }
    .club-name { grid-column: 2; text-align: center; white-space: normal; word-break: break-word; }
    .row-click { cursor: pointer; }
    .row-click:hover { background-color: rgba(255,255,255,.06); }

    /* Colunas */
    .w-actions { width: 16%; }
    .row-actions { display: inline-flex; justify-content: center; gap: .25rem; white-space: nowrap; }
    .w-name { width: 32%; min-width: 260px; }
    .w-city { width: 24%; }
    .w-state { width: 12%; }
    .w-country { width: 12%; }


    /* Barra de Filtros */
    .filters-bar .search-wrap { position: relative; }
    .filters-bar .search-wrap .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity: .7; }
    .filters-bar .search-wrap input.form-control { padding-left: 2rem; }

    /* Drawer de filtros (estilo similar ao de jogadores) */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); backdrop-filter: blur(1px); z-index: 1040; }
    .drawer-panel { position: fixed; top: 0; right: 0; width: 400px; max-width: 100%; height: 100%; background: var(--bs-body-bg); color: var(--bs-body-color); box-shadow: -6px 0 18px rgba(0,0,0,.2); z-index: 1041; display: flex; flex-direction: column; }
    .drawer-header { padding: .75rem 1rem; border-bottom: 1px solid var(--bs-border-color); display: flex; align-items: center; justify-content: space-between; }
    .drawer-body { padding: 1rem; gap: .75rem; display: flex; flex-direction: column; }
    .drawer-footer { padding: .75rem 1rem; border-top: 1px solid var(--bs-border-color); display: flex; justify-content: space-between; }
  `],
  template: `
<div class="container">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <div>
      <h3 class="m-0"><i class="bi bi-building text-success"></i> Clubes</h3>
      <small class="text-muted">Gerencie os clubes cadastrados</small>
    </div>
    <a class="btn btn-success" [routerLink]="['/clubes','novo']"><i class="bi bi-plus-lg"></i> Novo</a>
  </div>

  <!-- Barra de Filtros (igual Jogadores) -->
  <div class="row g-2 align-items-center mb-3 filters-bar">
    <div class="col">
      <div class="search-wrap">
        <i class="bi bi-search search-icon"></i>
        <input type="text" class="form-control" [value]="nameValue" (input)="onNameInput($event)" placeholder="Buscar por nome..." />
      </div>
    </div>
    <div class="col-auto">
      <button type="button" class="btn btn-outline-secondary position-relative" (click)="onOpenFilters()">
        <i class="bi bi-funnel me-1"></i> Filtros
        @if (advancedActive()) {
          <span class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle" title="Filtros ativos"></span>
        }
      </button>
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
        <table class="table table-striped table-hover align-middle mb-0">


        @if (!facade.loading() && filtered().length === 0) {
          <caption class="text-center py-4 text-muted">Nenhum clube encontrado</caption>
        }
        <thead>
          <tr>
            <th class="text-center w-actions"><div class="colhead"><i class="bi bi-lightning-charge col-ico"></i><div>Ações</div></div></th>
            <th class="w-name"><div class="colhead"><i class="bi bi-building col-ico"></i><div>Nome</div></div></th>
            <th class="w-city"><div class="colhead"><i class="bi bi-geo-alt col-ico"></i><div>Cidade</div></div></th>
            <th class="w-state"><div class="colhead"><i class="bi bi-map col-ico"></i><div>Estado</div></div></th>
            <th class="text-center w-country"><div class="colhead"><i class="bi bi-globe2 col-ico"></i><div>País</div></div></th>
          </tr>
        </thead>
        <tbody>
          @for (c of displayed(); track c.id) {
            <tr class="row-click" (click)="goTo(c.id)">
              <td class="text-center w-actions">
                <div class="row-actions">
                  <button type="button" class="btn btn-outline-danger btn-sm" (click)="onDelete(c); $event.stopPropagation()" title="Excluir clube">
                    <i class="bi bi-trash text-danger"></i>
                  </button>
                </div>
              </td>
              <td class="w-name">
                <div class="club-cell">
                  <div class="logo-slot">
                    @if (c.foto) {
                      <img class="club-logo" [src]="imgSrc(c.foto)" alt="clube" />
                    } @else {
                      <div class="club-logo d-inline-flex align-items-center justify-content-center bg-white">
                        <i class="bi bi-shield text-muted"></i>
                      </div>
                    }
                  </div>
                  <div class="fw-semibold club-name">{{ c.nome }}</div>
                </div>
              </td>
              <td class="text-center w-city">{{ c.cidade || '-' }}</td>
              <td class="text-center w-state">{{ c.estado || '-' }}</td>
              <td class="text-center w-country">
                <div class="d-flex align-items-center justify-content-center" style="min-height: 24px;">
                  @if (countryCodeFromPais(c.pais) && !flagBroken.has(c.id)) {
                    <img [src]="flagUrl(countryCodeFromPais(c.pais)!)" alt="flag" width="44" height="30"
                         class="flag-img" style="border-radius:2px" (error)="onFlagError(c.id)" />
                  } @else {
                    <i class="bi bi-globe2 text-primary" aria-label="País"></i>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  @if (showDrawer) {
    <div class="drawer-overlay" (click)="closeDrawer()"></div>
    <aside class="drawer-panel" role="dialog" aria-label="Filtros avançados">
      <div class="drawer-header">
        <strong>Filtros Avançados</strong>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="closeDrawer()"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="drawer-body">

        <div>
          <label class="form-label">Cidade</label>
          <input type="text" class="form-control" list="citiesList"
                 [value]="tempCidade" (input)="tempCidade=$any($event.target).value" />
        </div>
        <div>
          <label class="form-label">Estado (Sigla)</label>
          <input type="text" class="form-control" list="statesList" maxlength="2" autocomplete="off" placeholder="UF (ex: RJ)"
                 [value]="tempEstado" (input)="onEstadoInput($event)" />
        </div>
        <div>
          <label class="form-label">País</label>
          <input type="text" class="form-control" list="countriesList"
                 [value]="tempPais" (input)="tempPais=$any($event.target).value" />
        </div>

        <!-- Datalists dinâmicos -->
        <datalist id="citiesList">
          @for (o of citiesOptions(); track o) { <option [value]="o"></option> }
        </datalist>
        <datalist id="statesList">
          @for (o of statesOptions(); track o) { <option [value]="o"></option> }
        </datalist>
        <datalist id="countriesList">
          @for (o of countriesOptions(); track o) { <option [value]="o"></option> }
        </datalist>
      </div>
      <div class="drawer-footer">
        <button type="button" class="btn btn-outline-secondary" (click)="onClearAndClose()"><i class="bi bi-x-circle"></i> Limpar Filtros</button>
        <button type="button" class="btn btn-success" (click)="onApply()"><i class="bi bi-check2"></i> Aplicar Filtros</button>
      </div>
    </aside>
  }
</div>
  `
})
export class ClubListComponent implements OnInit {
  // Opções dinâmicas para autocomplete
  citiesOptions = computed(() => this.uniqueSorted(this.clubes().map(c => (c.cidade || '').trim())));
  statesOptions = computed(() => this.uniqueSorted(this.clubes().map(c => (c.estado || '').trim())));
  countriesOptions = computed(() => this.uniqueSorted(this.clubes().map(c => (c.pais || '').trim())));

  private uniqueSorted(arr: string[]): string[] {
    const set = new Set<string>();
    for (const s of arr) { if (s) set.add(s); }
    return Array.from(set).sort((a,b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }

  facade = inject(ClubesFacade);
  private router = inject(Router);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  clubes = this.facade.items; // ainda usado para montar listas de autocomplete
  filtered = this.facade.filtered;
  displayed = this.facade.displayed;

  // Indicador de filtros avançados ativos (exceto nome)
  advancedActive = computed(() => {
    const f = this.facade.filters();
    return !!(f.cidade?.trim() || f.estado?.trim() || f.pais?.trim());
  });

  // Drawer state
  showDrawer = false;

  tempCidade = '';
  tempEstado = '';
  tempPais = '';

  // Busca por nome com debounce 300ms
  nameValue = '';
  private nameDebTimer: any;
  onNameInput(ev: Event) {
    const val = (ev.target as HTMLInputElement).value || '';
    this.nameValue = val;
    if (this.nameDebTimer) clearTimeout(this.nameDebTimer);
    this.nameDebTimer = setTimeout(() => {
      this.facade.setFilters({ nome: val.trim() });
    }, 300);
  }

  onEstadoInput(ev: Event) {
    const raw = (ev.target as HTMLInputElement).value || '';
    const up = raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    this.tempEstado = up;
  }

  onOpenFilters() {
    const f = this.facade.filters();
    this.tempCidade = f.cidade || '';
    this.tempEstado = f.estado || '';
    this.tempPais = f.pais || '';
    this.showDrawer = true;
  }

  closeDrawer() { this.showDrawer = false; }

  onClearAndClose() {
    // Limpa apenas filtros avançados; preserva a busca por nome
    this.facade.setFilters({ cidade: '', estado: '', pais: '' });
    this.tempCidade = this.tempEstado = this.tempPais = '';
    this.showDrawer = false;
  }

  onApply() {
    // Aplica somente filtros avançados; o nome é controlado pela barra superior
    this.facade.setFilters({
      cidade: this.tempCidade || '',
      estado: this.tempEstado || '',
      pais: this.tempPais || ''
    });
    this.showDrawer = false;
  }

  goTo(id: number) {
    this.router.navigate(['/clubes', id]);
  }

  ngOnInit() {
    this.facade.load();
  }

  onFilter(value: string) {
    this.facade.setFilter(value);
  }

  async onDelete(c: Clube) {
    const ok = await this.dialog.confirm(`Excluir clube "${c.nome}"?`, { title: 'Confirmação', variant: 'danger', confirmText: 'Excluir' });
    if (!ok) return;
    this.facade.delete(c.id).subscribe({ next: () => {
      this.toast.success('Clube excluído');
      this.facade.load();
    }, error: () => this.toast.error('Falha ao excluir clube') });
  }

  flagBroken = new Set<number>();
  onFlagError(id: number) { this.flagBroken.add(id); }

  countryCodeFromPais(p?: string | null): string | null {
    if (!p) return null;
    const map: Record<string, string> = {
      'Brasil': 'br', 'Argentina': 'ar', 'Uruguai': 'uy', 'Paraguai': 'py', 'Chile': 'cl',
      'Col f4mbia': 'co', 'Peru': 'pe', 'Bol edvia': 'bo', 'Equador': 'ec', 'Venezuela': 've',
      'Portugal': 'pt', 'Espanha': 'es', 'Fran e7a': 'fr', 'It e1lia': 'it', 'Alemanha': 'de',
      'Reino Unido': 'gb', 'Inglaterra': 'gb', 'Holanda': 'nl', 'B e9lgica': 'be', 'Su ed e7a': 'ch', 'Áustria': 'at',
      'Estados Unidos': 'us', 'M e9xico': 'mx', 'Canad e1': 'ca', 'Jap e3o': 'jp', 'Coreia do Sul': 'kr', 'China': 'cn'
    };
    return map[p] ?? null;
  }

  flagUrl(code: string): string { return `/flags/${code}.svg`; }

  imgSrc(val?: string | null): string | null {
    if (!val) return null;
    if (val.startsWith('blob:') || val.startsWith('data:') || /^https?:\/\//.test(val)) return val;
    const path = val.startsWith('/') ? val : '/' + val;
    if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
      return 'http://127.0.0.1:5180' + path;
    }
    return path;
  }
}

