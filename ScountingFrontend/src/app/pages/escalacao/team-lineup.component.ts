import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TacticalFieldComponent } from '../../components/tactical-field/tactical-field.component';
import { FormationsService } from '../../services/formations.service';
import { LineupStateService } from '../../services/lineup-state.service';
import { JogadoresFacade } from '../../facades/jogadores.facade';

@Component({
  selector: 'app-team-lineup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TacticalFieldComponent],
  template: `
    <div class="lineup-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="d-flex align-items-center justify-content-between">
            <div class="header-content">
              <h1 class="page-title">
                <i class="bi bi-diagram-3 text-success"></i>
                Escalação Tática
              </h1>
            </div>

            <div class="header-actions">
              <button class="btn fifa-btn fifa-btn-outline" (click)="showTutorial()">
                <i class="bi bi-question-circle"></i>
                Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
  <div class="container-xxl py-4">
        <!-- Formation Analytics Panel (quando ativo) -->
        <div class="formation-analytics" *ngIf="showAnalyticsPanel()" [@slideInOut]>
          <div class="analytics-card">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h5 class="mb-0">
                <i class="bi bi-pie-chart"></i>
                Análise da Formação {{ currentFormationName() }}
              </h5>
              <button class="btn btn-sm btn-outline-light" (click)="showAnalyticsPanel.set(false)">
                <i class="bi bi-x"></i>
              </button>
            </div>

            <div class="analytics-content">
              <div class="row g-3">
                <div class="col-md-2" *ngFor="let stat of formationStats()">
                  <div class="stat-item">
                    <div class="stat-circle" [style.background]="getStatColor(stat.value)">
                      <span class="stat-value">{{ stat.value }}</span>
                    </div>
                    <div class="stat-label">{{ stat.label }}</div>
                  </div>
                </div>
              </div>

              <div class="tactics-description">
                <h6>Características Táticas:</h6>
                <ul class="characteristics-list">
                  <li *ngFor="let char of getTacticalCharacteristics()">{{ char }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Tutorial Panel (quando ativo) -->
        <div class="tutorial-panel" *ngIf="showTutorialPanel()" [@slideInOut]>
          <div class="tutorial-card">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h5 class="mb-0">
                <i class="bi bi-lightbulb"></i>
                Como usar a Escalação Tática
              </h5>
              <button class="btn btn-sm btn-outline-light" (click)="showTutorialPanel.set(false)">
                <i class="bi bi-x"></i>
              </button>
            </div>

            <div class="tutorial-content">
              <div class="tutorial-steps">
                <div class="step">
                  <div class="step-icon">1</div>
                  <div class="step-content">
                    <h6>Escolha a Formação</h6>
                    <p>Selecione uma das formações disponíveis (4-3-3, 4-4-2, etc.)</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-icon">2</div>
                  <div class="step-content">
                    <h6>Arraste os Jogadores</h6>
                    <p>Clique e arraste jogadores do banco para as posições no campo</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-icon">3</div>
                  <div class="step-content">
                    <h6>Ajuste a Escalação</h6>
                    <p>Mova jogadores entre posições e faça substituições conforme necessário</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-icon">4</div>
                  <div class="step-content">
                    <h6>Exporte</h6>
                    <p>Use os controles para exportar sua escalação para análise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Row -->
        <div class="quick-stats mb-4" *ngIf="!showAnalyticsPanel() && !showTutorialPanel()">
          <div class="row g-3">
            <div class="col-md-3">
              <div class="stat-box">
                <div class="stat-icon"><i class="bi bi-people"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ onFieldCount() }}</div>
                  <div class="stat-label">Em campo</div>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="stat-box">
                <div class="stat-icon"><i class="bi bi-star"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ averageRating() }}</div>
                  <div class="stat-label">Avaliação Média</div>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="stat-box">
                <div class="stat-icon"><i class="bi bi-arrows-vertical"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ averageHeight() }}</div>
                  <div class="stat-label">Altura Média</div>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="stat-box">
                <div class="stat-icon"><i class="bi bi-calendar3"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ averageAge() }}</div>
                  <div class="stat-label">Idade Média</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Layout: Campo (esquerda) + Jogadores (direita) -->
        <div class="lineup-main-layout">
          <div class="row g-0 h-100">
            <!-- Campo Tático (Esquerda) -->
            <div class="col-lg-8 col-xl-8 col-xxl-7 field-section">
              <app-tactical-field />
            </div>

            <!-- Jogadores Disponíveis (Direita) -->
            <div class="col-lg-4 col-xl-4 col-xxl-5 players-section">
              <div class="players-panel">
                <div class="panel-header">
                  <h5 class="mb-0">
                    <i class="bi bi-people"></i>
                    Jogadores Disponíveis
                    <span class="badge fifa-badge ms-2">{{ startersPlayers().length + reservesPlayers().length }}</span>
                  </h5>
                  <div class="search-box mt-2">
          <input type="text"
                           class="form-control fifa-input"
                           placeholder="Buscar jogador..."
                           [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)">
                    <i class="bi bi-search search-icon"></i>
                  </div>
                  <ul class="nav nav-tabs players-tabs mt-3">
                    <li class="nav-item">
                      <button type="button" class="nav-link" [class.active]="activeTab() === 'titulares'" (click)="activeTab.set('titulares')">
                        Titulares <span class="tab-badge">{{ startersPlayers().length }}</span>
                      </button>
                    </li>
                    <li class="nav-item">
                      <button type="button" class="nav-link" [class.active]="activeTab() === 'reservas'" (click)="activeTab.set('reservas')">
                        Reservas <span class="tab-badge">{{ reservesPlayers().length }}</span>
                      </button>
                    </li>
                    <li class="nav-item">
                      <button type="button" class="nav-link" [class.active]="activeTab() === 'nao'" (click)="activeTab.set('nao')">
                        Não relacionados <span class="tab-badge">{{ notRelatedPlayers().length }}</span>
                      </button>
                    </li>
                  </ul>
                </div>

                <div class="players-list">
                  <!-- Loading state -->
                  <div class="loading-players" *ngIf="jogadoresFacade.loading()">
                    <div class="d-flex align-items-center justify-content-center py-4">
                      <div class="spinner-border text-success me-3" role="status"></div>
                      <span class="text-muted">Carregando jogadores...</span>
                    </div>
                  </div>

                  <!-- Grupos: Titulares e Reservas -->
                  <div class="players-table-wrapper" *ngIf="!jogadoresFacade.loading()">
                    <!-- Titulares (Tab) -->
                    <div class="players-group" *ngIf="activeTab() === 'titulares'">
                      <table class="table players-table">
                        <thead>
                          <tr>
                            <th class="col-name">Jogador</th>
                            <th class="col-rating text-center">Nota</th>
                            <th class="col-nac">Nacionalidade</th>
                            <th class="col-pos">Posição</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let player of startersPlayers()"
                              [attr.draggable]="true"
                              (dragstart)="onPlayerDragStart(player, $event)"
                              (click)="navigateToProfile(player?.id)"
                              class="player-row starter row-click">
                            <td class="col-name">
                              <div class="d-flex align-items-center gap-1">
                                <div class="avatar" *ngIf="player?.foto">
                                  <img [src]="player?.foto" alt="{{ player?.nome }}" (error)="$event.target['style'].display='none'">
                                </div>
                                <div class="name">
                                  <div class="fw-semibold">{{ player?.nome }}</div>
                                  <div class="subline text-muted small">{{ ageFrom(player?.dataNascimento) }} anos • {{ player?.peDominante || '-' }}</div>
                                  <span class="badge-inline">Em campo</span>
                                </div>
                              </div>
                            </td>
                            <td class="text-center col-rating">
                              <span class="rating-badge"
                                    [class.high]="ratingForBadge(player) >= 8"
                                    [class.mid]="ratingForBadge(player) >= 6 && ratingForBadge(player) < 8"
                                    [class.low]="ratingForBadge(player) > 0 && ratingForBadge(player) < 6"
                                    [class.na]="ratingForBadge(player) === 0">
                                {{ ratingDisplay(player) }}
                              </span>
                            </td>
                            <td class="col-nac text-center align-middle">
                              <div class="d-flex align-items-center justify-content-center" style="min-height: 30px;">
                                <ng-container *ngIf="getFlagCode(player) as cc; else globeTit">
                                  <img [src]="flagUrl(cc)" alt="flag" width="44" height="30" class="flag-img" style="border-radius:2px" (error)="markFlagBroken(player?.id)" />
                                </ng-container>
                                <ng-template #globeTit><i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i></ng-template>
                              </div>
                            </td>
                              <td class="col-pos align-middle">
                                <div class="d-flex align-items-center gap-2 justify-content-start">
                                  <i class="bi {{ positionIcon(player?.posicao) }} text-success" style="font-size:18px"></i>
                                  <span class="badge text-bg-dark border">{{ player?.posicao || '-' }}</span>
                                </div>
                              </td>
                          </tr>
                          <tr *ngIf="startersPlayers().length === 0">
                            <td colspan="4" class="text-muted small py-2">Nenhum titular no momento.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Reservas (Tab) -->
                    <div class="players-group" *ngIf="activeTab() === 'reservas'">
                      <table class="table players-table with-actions">
                        <thead>
                          <tr>
                            <th class="col-name">Jogador</th>
                            <th class="col-rating text-center">Nota</th>
                            <th class="col-nac">Nacionalidade</th>
                            <th class="col-pos">Posição</th>
                            <th class="text-center actions-col">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let player of reservesPlayers()"
                              [attr.draggable]="true"
                              (dragstart)="onPlayerDragStart(player, $event)"
                              (click)="navigateToProfile(player?.id)"
                              class="player-row reserve row-click">
                            <td class="col-name">
                              <div class="d-flex align-items-center gap-1">
                                <div class="avatar" *ngIf="player?.foto">
                                  <img [src]="player?.foto" alt="{{ player?.nome }}" (error)="$event.target['style'].display='none'">
                                </div>
                                <div>
                                  <div class="name fw-semibold">{{ player?.nome }}</div>
                                  <div class="subline text-muted small">{{ ageFrom(player?.dataNascimento) }} anos • {{ player?.peDominante || '-' }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="text-center col-rating">
                              <span class="rating-badge"
                                    [class.high]="ratingForBadge(player) >= 8"
                                    [class.mid]="ratingForBadge(player) >= 6 && ratingForBadge(player) < 8"
                                    [class.low]="ratingForBadge(player) > 0 && ratingForBadge(player) < 6"
                                    [class.na]="ratingForBadge(player) === 0">
                                {{ ratingDisplay(player) }}
                              </span>
                            </td>
                            <td class="col-nac text-center align-middle">
                              <div class="d-flex align-items-center justify-content-center" style="min-height: 30px;">
                                <ng-container *ngIf="getFlagCode(player) as cc; else globeRes">
                                  <img [src]="flagUrl(cc)" alt="flag" width="44" height="30" class="flag-img" style="border-radius:2px" (error)="markFlagBroken(player?.id)" />
                                </ng-container>
                                <ng-template #globeRes><i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i></ng-template>
                              </div>
                            </td>
                            <td class="col-pos align-middle">
                              <div class="d-flex align-items-center gap-2 justify-content-start">
                                <i class="bi {{ positionIcon(player?.posicao) }} text-success" style="font-size:18px"></i>
                                <span class="badge text-bg-dark border">{{ player?.posicao || '-' }}</span>
                              </div>
                            </td>
                            <td class="actions-cell text-center">
                              <button type="button" class="btn btn-sm btn-icon btn-link text-muted" title="Não relacionar" aria-label="Não relacionar" (click)="markNotRelated(player?.id); $event.stopPropagation()">
                                <i class="bi bi-slash-circle"></i>
                              </button>
                            </td>
                          </tr>
                          <tr *ngIf="reservesPlayers().length === 0">
                            <td colspan="5" class="text-muted small py-2">Nenhum reserva disponível.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>


                    <!-- Não relacionados (Tab) -->
                    <div class="players-group" *ngIf="activeTab() === 'nao'">
                      <table class="table players-table with-actions">
                        <thead>
                          <tr>
                            <th class="col-name">Jogador</th>
                            <th class="col-rating text-center">Nota</th>
                            <th class="col-nac">Nacionalidade</th>
                            <th class="col-pos">Posição</th>
                            <th class="text-center actions-col">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let player of notRelatedPlayers()"
                              [attr.draggable]="true"
                              (dragstart)="onPlayerDragStart(player, $event)"
                              (click)="navigateToProfile(player?.id)"
                              class="player-row reserve row-click">
                            <td class="col-name">
                              <div class="d-flex align-items-center gap-1">
                                <div class="avatar" *ngIf="player?.foto">
                                  <img [src]="player?.foto" alt="{{ player?.nome }}" (error)="$event.target['style'].display='none'">
                                </div>
                                <div>
                                <div class="__fix__">
                                  <div class="name fw-semibold">{{ player?.nome }}</div>
                                  <div class="subline text-muted small">{{ ageFrom(player?.dataNascimento) }} anos • {{ player?.peDominante || '-' }}</div><!-- fffffffff f fff fffffff f ffffffffff fffffff fffffff f fff f ffff f ffff</div>
                                  --> </div>
                                </div>
                              </div>
                            </td>
                            <td class="text-center col-rating">
                              <span class="rating-badge"
                                    [class.high]="ratingForBadge(player) >= 8"
                                    [class.mid]="ratingForBadge(player) >= 6 && ratingForBadge(player) < 8"
                                    [class.low]="ratingForBadge(player) > 0 && ratingForBadge(player) < 6"
                                    [class.na]="ratingForBadge(player) === 0">
                                {{ ratingDisplay(player) }}
                              </span>
                            </td>
                            <td class="col-nac text-center align-middle">
                              <div class="d-flex align-items-center justify-content-center" style="min-height: 30px;">
                                <ng-container *ngIf="getFlagCode(player) as cc; else globeNaRel">
                                  <img [src]="flagUrl(cc)" alt="flag" width="44" height="30" class="flag-img" style="border-radius:2px" (error)="markFlagBroken(player?.id)" />
                                </ng-container>
                                <ng-template #globeNaRel><i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i></ng-template>
                              </div>
                            </td>
                            <td class="col-pos align-middle">
                              <div class="d-flex align-items-center gap-2 justify-content-start">
                                <i class="bi {{ positionIcon(player?.posicao) }} text-success" style="font-size:18px"></i>
                                <span class="badge text-bg-dark border">{{ player?.posicao || '-' }}</span>
                              </div>
                            </td>
                            <td class="actions-cell text-center">
                              <button type="button" class="btn btn-sm btn-icon btn-link text-muted" title="Relacionar" aria-label="Relacionar" (click)="relatePlayer(player?.id); $event.stopPropagation()">
                                <i class="bi bi-check-circle"></i>
                              </button>
                            </td>
                          </tr>
                          <tr *ngIf="notRelatedPlayers().length === 0">
                            <td colspan="5" class="text-muted small py-2">Nenhum jogador não relacionado.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Empty state -->
                  <div class="empty-players" *ngIf="!jogadoresFacade.loading() && (startersPlayers().length + reservesPlayers().length + notRelatedPlayers().length) === 0">
                    <i class="bi bi-person-x text-muted"></i>
                    <p class="text-muted mb-0 mt-2" *ngIf="jogadoresFacade.items().length === 0; else noMatch2">
                      Nenhum jogador cadastrado.
                      <a routerLink="/jogadores" class="text-success text-decoration-none">Cadastre jogadores aqui</a>
                    </p>
                    <ng-template #noMatch2>
                      <p class="text-muted mb-0 mt-2">Nenhum jogador corresponde ao filtro aplicado</p>
                    </ng-template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .lineup-page { min-height: 100vh; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-elev) 100%); }
    .page-header { background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 24px 0; backdrop-filter: blur(10px); }
    .page-title { color: white; font-weight: 900; font-size: 2.5rem; margin-bottom: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .formation-analytics, .tutorial-panel { margin-bottom: 24px; }
    .lineup-main-layout { height: calc(100vh - 200px); min-height: 600px; }
    .field-section { background: linear-gradient(135deg, var(--bg) 0%, var(--bg-elev) 100%); border-radius: 20px 0 0 20px; padding: 0; position: relative; overflow: hidden; }
    .flag-img { transition: all .2s ease; }
    .flag-img:hover { border: 1px solid var(--bs-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .row-click { cursor: pointer; transition: background-color .2s ease; }
    .row-click:hover { background-color: rgba(255,255,255,0.06); }
    .players-table { table-layout: fixed; width: 100%; }
    .players-table thead th { white-space: nowrap; }
    .players-table th, .players-table td { vertical-align: middle; }
    .players-table th + th, .players-table td + td { padding-left: 12px; }
    .players-table .col-name { width: auto; padding-right: 16px; }
    .players-table .col-rating { width: 64px; white-space: nowrap; }
    .players-table .col-nac { width: 120px; white-space: nowrap; }
    .players-table .col-pos { width: 128px; white-space: nowrap; }
    .players-table .actions-col { width: 72px; white-space: nowrap; }
    .players-table .col-name .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .players-table .col-name .subline { max-width: 100%; }
    .rating-badge { border-radius: 999px; padding: .15rem .5rem; font-weight: 700; min-width: 40px; display: inline-flex; align-items:center; justify-content:center; }
    .rating-badge.high { background: #10B981; color: #fff; }
    .rating-badge.mid { background: #f59e0b; color: #111; }
    .rating-badge.low { background: #ef4444; color: #fff; }
    .rating-badge.na { background: #6B7280; color: #fff; }
    .__fix__ { max-height: 32px; overflow: hidden; }
    .subline { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  `],
  animations: [
    // Adicionar animações do Angular se necessário
  ]
})
export class TeamLineupComponent {
  private formationsService = inject(FormationsService);
  public jogadoresFacade = inject(JogadoresFacade);
  private lineupState = inject(LineupStateService);

  private router = inject(Router);

  // Signals
  showAnalyticsPanel = signal(false);
  showTutorialPanel = signal(false);
  searchTerm = signal('');
  activeTab = signal<'titulares' | 'reservas' | 'nao'>('reservas');
  private notRelatedIds = signal<number[]>([]);

  constructor() {
    // Carrega os jogadores ao inicializar a página
    this.jogadoresFacade.load();
    // Carrega IDs não relacionados do localStorage
    try {
      const raw = localStorage.getItem('escalacao:notRelatedIds');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const ids = arr.map((x: any) => Number(x)).filter((n: any) => Number.isFinite(n));
          this.notRelatedIds.set(ids);
        }
      }
    } catch {}

    // Effect para automaticamente remover jogadores não relacionados quando colocados em campo
    effect(() => {
      const usedPlayerIds = this.lineupState.usedPlayerIds();
      const currentNotRelated = this.notRelatedIds();

      // Se algum jogador não relacionado foi colocado em campo, remove da lista
      const updatedNotRelated = currentNotRelated.filter(id => !usedPlayerIds.includes(id));

      if (updatedNotRelated.length !== currentNotRelated.length) {
        this.notRelatedIds.set(updatedNotRelated);
        // Salva no localStorage também
        try {
          localStorage.setItem('escalacao:notRelatedIds', JSON.stringify(updatedNotRelated));
        } catch {}
      }
    });
  }

  // Computed properties
  currentFormationName = computed(() => {
    return '4-3-3'; // Deve vir do tactical field component
  });

  // Quantos jogadores estão atualmente no campo
  onFieldCount = computed(() => this.lineupState.usedPlayerIds().length);
  // Total de jogadores cadastrados
  totalPlayers = computed(() => this.jogadoresFacade.items().length);

  filteredPlayers = computed(() => {
    // Base: todos os jogadores carregados (sempre incluir os que estão no campo)
    const all = this.jogadoresFacade.items();
    // Filtro por termo de busca
    const raw = this.searchTerm();
    if (!raw || raw.trim() === '') return all;
    const term = raw.toLowerCase().trim();
    return all.filter(player =>
      player.nome?.toLowerCase().includes(term) ||
      player.posicao?.toLowerCase().includes(term) ||
      player.clubeAtual?.nome?.toLowerCase().includes(term) ||
      player.nacionalidade?.toLowerCase().includes(term)
    );
  });

  // IDs atualmente em campo (mantidos no estado global do lineup)
  usedPlayerIds = computed(() => this.lineupState.usedPlayerIds());
  // Mantém titulares sempre visíveis no filtro
  startersPlayers = computed(() => {
    const ids = new Set(this.usedPlayerIds());
    const allPlayers = this.jogadoresFacade.items();
    const playersInField = allPlayers.filter(p => ids.has(p.id));
    const uniquePlayersMap = new Map();
    playersInField.forEach(player => { if (!uniquePlayersMap.has(player.id)) { uniquePlayersMap.set(player.id, player); } });
    return Array.from(uniquePlayersMap.values());
  });
  reservesPlayers = computed(() => {
    const usedIds = new Set(this.usedPlayerIds());
    const notRelatedIds = new Set(this.notRelatedIds());
    const allPlayers = this.jogadoresFacade.items();
    const availablePlayers = allPlayers.filter(p => !usedIds.has(p.id) && !notRelatedIds.has(p.id));
    const uniquePlayersMap = new Map();
    availablePlayers.forEach(player => { if (!uniquePlayersMap.has(player.id)) { uniquePlayersMap.set(player.id, player); } });
    const uniquePlayers = Array.from(uniquePlayersMap.values());
    const searchTerm = this.searchTerm();
    if (!searchTerm || searchTerm.trim() === '') return uniquePlayers;
    const term = searchTerm.toLowerCase().trim();
    return uniquePlayers.filter(player =>
      player.nome?.toLowerCase().includes(term) ||
      player.posicao?.toLowerCase().includes(term) ||
      player.nacionalidade?.toLowerCase().includes(term)
    );
  });

  // Lista de não relacionados
  notRelatedPlayers = computed(() => {
    const notRelatedIds = new Set(this.notRelatedIds());
    const allPlayers = this.jogadoresFacade.items();
    const usedPlayerIds = new Set(this.lineupState.usedPlayerIds());
    const notRelatedPlayers = allPlayers.filter(p => notRelatedIds.has(p.id) && !usedPlayerIds.has(p.id));
    const uniquePlayersMap = new Map();
    notRelatedPlayers.forEach(player => { if (!uniquePlayersMap.has(player.id)) { uniquePlayersMap.set(player.id, player); } });
    const uniquePlayers = Array.from(uniquePlayersMap.values());
    const searchTerm = this.searchTerm();
    if (!searchTerm || searchTerm.trim() === '') return uniquePlayers;
    const term = searchTerm.toLowerCase().trim();
    return uniquePlayers.filter(player =>
      player.nome?.toLowerCase().includes(term) ||
      player.posicao?.toLowerCase().includes(term) ||
      player.nacionalidade?.toLowerCase().includes(term)
    );
  });

  // Ações para marcar/relacionar
  markNotRelated(id?: number | null) {
    if (!Number.isFinite(id as number)) return;
    const current = new Set(this.notRelatedIds());
    current.add(id as number);
    const next = Array.from(current);
    this.notRelatedIds.set(next);
    try { localStorage.setItem('escalacao:notRelatedIds', JSON.stringify(next)); } catch {}
  }

  relatePlayer(id?: number | null) {
    if (!Number.isFinite(id as number)) return;
    const current = new Set(this.notRelatedIds());
    current.delete(id as number);
    const next = Array.from(current);
    this.notRelatedIds.set(next);
    try { localStorage.setItem('escalacao:notRelatedIds', JSON.stringify(next)); } catch {}
  }

  averageAge = computed(() => {
    const playersInField = this.startersPlayers();
    if (playersInField.length === 0) return '--';
    const today = new Date();
    let sum = 0;
    let count = 0;
    for (const player of playersInField) {
      const dob = player?.dataNascimento;
      if (!dob) continue;
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) continue;
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      sum += age;
      count++;
    }
    if (count === 0) return '--';
    const average = sum / count;
    return average.toFixed(1);
  });

  // Avaliação média dos jogadores em campo
  averageRating = computed(() => {
    const playersInField = this.startersPlayers();
    if (playersInField.length === 0) return '--';
    const ratingsSum = playersInField.reduce((sum, player) => { const rating = this.ratingValue(player); return sum + (rating > 0 ? rating : 0); }, 0);
    const validRatings = playersInField.filter(p => this.ratingValue(p) > 0).length;
    if (validRatings === 0) return '--';
    const average = ratingsSum / validRatings;
    return average.toFixed(1);
  });

  // Altura média dos jogadores em campo
  averageHeight = computed(() => {
    const playersInField = this.startersPlayers();
    if (playersInField.length === 0) return '--';
    const heightsSum = playersInField.reduce((sum, player) => { const height = player.altura; return sum + (height ? parseFloat(height.toString()) : 0); }, 0);
    const validHeights = playersInField.filter(p => p.altura && p.altura > 0).length;
    if (validHeights === 0) return '--';
    const average = heightsSum / validHeights;
    return average.toFixed(2) + 'm';
  });

  formationStats = computed(() => {
    const analysis = this.formationsService.analyzeFormation(this.currentFormationName());
    return [
      { label: 'Ataque', value: analysis.offensivePower },
      { label: 'Defesa', value: analysis.defensiveSolidity },
      { label: 'Meio', value: analysis.midfieldControl },
      { label: 'Largura', value: analysis.width },
      { label: 'Equilíbrio', value: analysis.balance }
    ];
  });

  showTutorial() { this.showTutorialPanel.set(!this.showTutorialPanel()); this.showAnalyticsPanel.set(false); }
  showAnalytics() { this.showAnalyticsPanel.set(!this.showAnalyticsPanel()); this.showTutorialPanel.set(false); }

  getStatColor(value: number): string {
    if (value >= 80) return 'linear-gradient(135deg, #22c55e, #16a34a)';
    if (value >= 60) return 'linear-gradient(135deg, #6B7280, #4B5563)';
    if (value >= 40) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
  }

  getTacticalCharacteristics(): string[] {
    const formationName = this.currentFormationName();
    const characteristics: Record<string, string[]> = {
      '4-3-3': ['Formação ofensiva com 3 atacantes','Boa largura no ataque pelas pontas','Meio-campo equilibrado com 3 jogadores','Pressão alta e jogo de posse'],
      '4-4-2': ['Formação clássica e equilibrada','Compactação defensiva eficiente','Dupla de atacantes complementares','Transições rápidas ataque-defesa'],
      '4-2-3-1': ['Controle do meio-campo com dupla volante','Criatividade com 3 meias ofensivos','Proteção defensiva aprimorada','Versatilidade tática']
    };
    return characteristics[formationName] || ['Formação personalizada'];
  }

  // Método para lidar com o drag de jogadores do sidebar
  onPlayerDragStart(player: any, event: DragEvent) {
    if (event.dataTransfer) {
      const dragData = { playerId: player.id, player: player, positionId: null };
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'move';
      try {
        const target = event.target as HTMLElement | null;
        const row = target?.closest('tr') as HTMLElement | null;
        const imgEl = row?.querySelector('.avatar img') as HTMLImageElement | null;
        if (imgEl && typeof event.dataTransfer.setDragImage === 'function') {
          const clone = imgEl.cloneNode(true) as HTMLImageElement;
          clone.style.width = '44px'; clone.style.height = '44px'; clone.style.borderRadius = '50%'; clone.style.objectFit = 'cover'; clone.style.position = 'absolute'; clone.style.top = '-1000px'; clone.style.left = '-1000px'; clone.style.pointerEvents = 'none';
          document.body.appendChild(clone);
          event.dataTransfer.setDragImage(clone, 22, 22);
          setTimeout(() => { try { document.body.removeChild(clone); } catch {} }, 0);
        } else if (typeof Image !== 'undefined' && typeof event.dataTransfer.setDragImage === 'function') {
          const ghost = new Image();
          ghost.src = player?.foto || '/brand/user-placeholder.png';
          event.dataTransfer.setDragImage(ghost, 22, 22);
        }
      } catch {}
    }
  }

  // Utilitário: calcular idade a partir da data de nascimento (ISO)
  ageFrom(dateIso?: string | null): string {
    if (!dateIso) return '--';
    const today = new Date();
    const birth = new Date(dateIso);
    if (isNaN(birth.getTime())) return '--';
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  }

  // Navega para o perfil do jogador ao clicar na linha
  navigateToProfile(id?: number | null) {
    if (!Number.isFinite(id as number)) return;
    this.router.navigate(['/jogadores', id, 'perfil']);
  }

  // Valor de nota normalizado 0..10 (para cor da badge)
  ratingForBadge(player: any): number {
    // Usa a mesma cadeia de campos que o display usa, mas normaliza para 0..10
    const src = player?.notaGeral ?? player?.overall ?? player?.notaFinalMedia ?? player?.rating;
    const n = typeof src === 'number' ? src : (src != null ? parseFloat(src) : NaN);
    if (isNaN(n)) return 0;
    // Se vier na escala 0..100, normaliza dividindo por 10
    const scaled = n > 10 ? n / 10 : n;
    return Math.max(0, Math.min(10, scaled));
  }

  // Ícone por macro-posição
  positionIcon(pos?: string | null): string {
    const p = (pos || '').toLowerCase();
    if (p.includes('goleiro')) return 'bi-shield-fill-check';
    if (p.includes('zagueiro')) return 'bi-shield-fill';
    if (p.includes('lateral')) return 'bi-arrows-expand';
    if (p.includes('volante')) return 'bi-diagram-3-fill';
    if (p.includes('meia')) return 'bi-lightbulb-fill';
    if (p.includes('ponta')) return 'bi-lightning-fill';
    if (p.includes('atacante')) return 'bi-bullseye';
    return 'bi-person-fill';
  }


  // Nota/rating utilitários
  ratingValue(player: any): number {
    const v = player?.notaGeral ?? player?.overall ?? player?.notaFinalMedia ?? player?.rating;
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(99, Math.round(n)));
  }

  ratingDisplay(player: any): string {
    const n = this.ratingValue(player);
    return n > 0 ? String(n) : '--';
  }

  // Bandeiras: helpers e fallback
  flagBroken = new Set<number>();

  markFlagBroken(id?: number | null) { if (id != null) this.flagBroken.add(id); }
  isFlagBroken(id?: number | null): boolean { return id != null && this.flagBroken.has(id); }

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

  flagUrl(code: string): string { return `/flags/${code}.svg`; }

  getFlagCode(player: any): string | null {
    if (!player) return null;
    if (this.isFlagBroken(player?.id)) return null;
    const cc = this.countryCodeFrom(player?.nacionalidade);
    return cc || null;
  }

}
