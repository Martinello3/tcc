import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TacticalFieldComponent } from '../../components/tactical-field/tactical-field.component';
import { FormationsService } from '../../services/formations.service';
import { LineupStateService } from '../../services/lineup-state.service';
import { JogadoresFacade } from '../../facades/jogadores.facade';
import { ToastService } from '../../services/toast.service';

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

            <div class="header-actions d-flex align-items-center gap-2">
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
              <app-tactical-field (exportPdf)="onExportFromField()"></app-tactical-field>
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
                            <th class="col-nac">Nac.</th>
                            <th class="col-pos">Posição</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let player of startersPlayers()"
                              [attr.draggable]="true"
                              (dragstart)="onPlayerDragStart(player, $event)"
                              class="player-row starter row-click">
                            <td class="col-name">
                              <div class="cell-content">
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
                                  <img [src]="flagUrl(cc)" alt="flag" width="30" height="20" class="flag-img" style="border-radius:2px" (error)="markFlagBroken(player?.id)" />
                                </ng-container>
                                <ng-template #globeTit><i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i></ng-template>
                              </div>
                            </td>
                              <td class="col-pos align-middle">
                                <div class="d-flex align-items-center gap-2 justify-content-start">
                                  <i class="bi {{ positionIcon(player?.posicao) }} text-success" style="font-size:22px"></i>
                                  <span class="badge text-bg-dark border">{{ player?.posicao || '-' }}</span>
                                </div>
                                <div class="hover-actions">
                                  <button type="button" class="btn btn-sm btn-icon" title="Ver Perfil" (click)="navigateToProfile(player?.id); $event.stopPropagation()">
                                    <i class="bi bi-person-square"></i>
                                  </button>
                                  <button type="button" class="btn btn-sm btn-icon" title="Marcar como Não Relacionado" (click)="markNotRelated(player?.id); $event.stopPropagation()">
                                    <i class="bi bi-slash-circle"></i>
                                  </button>
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
                            <th class="col-nac">Nac.</th>
                            <th class="col-pos">Posição</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let player of reservesPlayers()"
                              [attr.draggable]="true"
                              (dragstart)="onPlayerDragStart(player, $event)"
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
                                  <img [src]="flagUrl(cc)" alt="flag" width="30" height="20" class="flag-img" style="border-radius:2px" (error)="markFlagBroken(player?.id)" />
                                </ng-container>
                                <ng-template #globeRes><i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i></ng-template>
                              </div>
                            </td>
                            <td class="col-pos align-middle">
                              <div class="d-flex align-items-center gap-2 justify-content-start">
                                <i class="bi {{ positionIcon(player?.posicao) }} text-success" style="font-size:22px"></i>
                                <span class="badge text-bg-dark border">{{ player?.posicao || '-' }}</span>
                              </div>
                              <div class="hover-actions">
                                <button type="button" class="btn btn-sm btn-icon" title="Ver Perfil" (click)="navigateToProfile(player?.id); $event.stopPropagation()">
                                  <i class="bi bi-person-square"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-icon" title="Marcar como Não Relacionado" (click)="markNotRelated(player?.id); $event.stopPropagation()">
                                  <i class="bi bi-slash-circle"></i>
                                </button>
                              </div>
                            </td>

                          </tr>
                          <tr *ngIf="reservesPlayers().length === 0">
                            <td colspan="4" class="text-muted small py-2">Nenhum reserva disponível.</td>
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
                            <th class="col-nac">Nac.</th>
                            <th class="col-pos">Posição</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let player of notRelatedPlayers()"
                              [attr.draggable]="true"
                              (dragstart)="onPlayerDragStart(player, $event)"
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
                                  <img [src]="flagUrl(cc)" alt="flag" width="30" height="20" class="flag-img" style="border-radius:2px" (error)="markFlagBroken(player?.id)" />
                                </ng-container>
                                <ng-template #globeNaRel><i class="bi bi-globe text-primary" aria-label="Nacionalidade"></i></ng-template>
                              </div>
                            </td>
                            <td class="col-pos align-middle">
                              <div class="d-flex align-items-center gap-2 justify-content-start">
                                <i class="bi {{ positionIcon(player?.posicao) }} text-success" style="font-size:22px"></i>
                                <span class="badge text-bg-dark border">{{ player?.posicao || '-' }}</span>
                              </div>
                              <div class="hover-actions">
                                <button type="button" class="btn btn-sm btn-icon" title="Ver Perfil" (click)="navigateToProfile(player?.id); $event.stopPropagation()">
                                  <i class="bi bi-person-square"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-icon" title="Relacionar" (click)="relatePlayer(player?.id); $event.stopPropagation()">
                                  <i class="bi bi-check-circle"></i>
                                </button>
                              </div>
                            </td>

                          </tr>
                          <tr *ngIf="notRelatedPlayers().length === 0">
                            <td colspan="4" class="text-muted small py-2">Nenhum jogador não relacionado.</td>
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
    .row-click { cursor: default; transition: background-color .2s ease; }
    .row-click:hover { background-color: rgba(255,255,255,0.06); }
    .players-table { table-layout: fixed; width: 100%; }
    .players-table thead th { white-space: nowrap; }
    .players-table thead th.col-nac { text-align: center; text-transform: uppercase; }
    .players-table th, .players-table td { vertical-align: middle; }
    .players-table tbody tr { position: relative; }
    .players-table tbody td { padding-top: 18px; padding-bottom: 18px; }
    .players-table th + th, .players-table td + td { padding-left: 16px; }
    .players-table .col-name { width: auto; min-width: 340px; padding-right: 16px; }
    .players-table .col-rating { width: 84px; white-space: nowrap; }
    .players-table .col-nac { width: 90px; white-space: nowrap; text-align: center; }
    .players-table .col-pos { width: 170px; white-space: nowrap; padding-right: 0; }
    .players-table .actions-col { display: none; }
    .players-table .hover-actions { position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%); display: none; gap: 6px; z-index: 2; justify-content: center; }
    .players-table tbody tr:hover .hover-actions { display: inline-flex; }
    .players-table tbody tr:hover td > :not(.hover-actions) { opacity: .18; filter: blur(.2px); transition: opacity .15s ease; }
    .players-table .hover-actions .btn { width: 42px; height: 42px; padding: 0; border-radius: 6px; background: rgba(0,0,0,0.35); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
    .players-table .hover-actions .btn i { font-size: 22px; line-height: 1; }
    .players-table .hover-actions .btn:hover { background: rgba(0,0,0,0.5); color: #fff; }
    .players-table .col-name .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .players-table .col-name .subline { max-width: 100%; }
    .players-table .col-name .avatar img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    .rating-badge { border-radius: 999px; padding: .2rem .6rem; font-weight: 700; min-width: 46px; font-size: .95rem; display: inline-flex; align-items:center; justify-content:center; }
    .rating-badge.high { background: #10B981; color: #fff; }
    .rating-badge.mid { background: #f59e0b; color: #111; }
    .rating-badge.low { background: #ef4444; color: #fff; }
    .rating-badge.na { background: #6B7280; color: #fff; }
    .players-table .col-pos .badge { font-size: .85rem; padding: .35rem .6rem; }
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
  private toast = inject(ToastService);

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
    const scaled = n > 10 ? n / 10 : n; // normaliza se vier 0..100
    return Math.max(0, Math.min(10, scaled));
  }

  ratingDisplay(player: any): string {
    const val = this.ratingValue(player);
    if (val <= 0) return '--';
    const rounded = Math.round(val * 100) / 100; // no máximo 2 casas
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
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

  onExportFromField() {
    console.log('=== exportPdf EVENT recebido no TeamLineup ===');
    this.exportToPDF();
  }


  // Exportação de PDF da escalação tática
  async exportToPDF() {
    console.log('=== exportToPDF CHAMADO ===');
    try {
      console.log('[ExportPDF] Iniciando coleta de dados...');
      // Dar um pequeno tempo para sinais sincronizarem
      await new Promise(resolve => setTimeout(resolve, 120));
      // 1) Coletar dados da formação e jogadores
      const formationId = (this as any).lineupState.currentFormationId?.() || this.currentFormationName();
      const formation = (this as any).formationsService.getFormationById?.(formationId);
      const playersInFormation = (this as any).lineupState.playersInFormation?.() || [];
      const placed = playersInFormation.filter((p: any) => p?.playerId && p?.player);
      const starters = this.startersPlayers();
      const reserves = this.reservesPlayers();
      console.log('[ExportPDF] Debug LineupState:', this.lineupState);
      console.log('[ExportPDF] playersInFormation RAW:', playersInFormation);
      console.log('[ExportPDF] usedPlayerIds:', this.usedPlayerIds());
      console.log('[ExportPDF] jogadoresFacade.items():', this.jogadoresFacade.items());
      console.log('[ExportPDF] Coletado:', { formationId, positions: formation?.positions?.length || 0, placed: placed.length, starters: starters?.length || 0, reserves: reserves?.length || 0 });

      // Validação obrigatória: exatamente 11 titulares
      console.log('[ExportPDF] Validando jogadores em campo (temporariamente >= 1)...');
      if ((placed?.length || 0) < 1) {
        console.warn('[ExportPDF] Falha na validação mínima', { starters: starters?.length || 0, placed: placed.length });
        this.toast.error('Nenhum jogador posicionado no campo.', 'Relatório Tático');
        return;
      }
      console.log('[ExportPDF] Validação mínima OK.');

      // Mapa de posições (x,y)
      const positionsMap: Record<string, { x: number; y: number; label: string }> = {};
      if (formation?.positions) {
        for (const pos of formation.positions) { positionsMap[pos.id] = { x: pos.x, y: pos.y, label: pos.label }; }
      }

      // Utilitários de formatação
      const brand = '#10B981';
      const textMain = '#333333';
      const textSec = '#666666';
      const border = '#E0E0E0';

      const ellipsis = (s: any, max = 30) => { const str = (s == null ? '' : String(s)); return str.length > max ? str.slice(0, max - 1) + '…' : str; };
      const initials = (name: string) => { if (!name) return '?'; const parts = name.trim().split(/\s+/).filter(Boolean); const a = (parts[0]||'').charAt(0); const b = (parts[parts.length-1]||'').charAt(0); return (a+b).toUpperCase(); };
      const formatLongDate = (d: Date) => { const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']; return `${d.getDate()} de ${meses[d.getMonth()] } de ${d.getFullYear()}`.replace(/^\d{1}(?=\s)/, m => m); };

      // Campo tático: nós para 11 jogadores nas coordenadas da formação
      const playersNodes = placed.map((pf: any) => {
        const pos = positionsMap[pf.positionId] || { x: 50, y: 50, label: '' };
        const pl = pf.player || {};
        const label = pl?.numeroCamisa != null && pl?.numeroCamisa !== '' ? String(pl.numeroCamisa) : initials(pl?.nome || '');
        const nameUnder = ellipsis(pl?.nome || '', 18);
        return `
          <div style="position:absolute; left:${pos.x}%; top:${pos.y}%; transform:translate(-50%,-50%); text-align:center;">
            <div style="width:50px; height:50px; border-radius:999px; background:${brand}; border:2px solid #FFFFFF; box-shadow:0 2px 4px rgba(0,0,0,.1); display:flex; align-items:center; justify-content:center; font:700 18px Inter, Roboto, Arial, sans-serif; color:#FFFFFF;">${label}</div>
            <div style="margin-top:6px; font:400 9pt Inter, Roboto, Arial, sans-serif; color:${textMain}; max-width:90px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nameUnder}</div>
          </div>`;
      }).join('');

      // Listas
      const titularesList = placed.map((pf: any) => {
        const p = pf?.player || {};
        const nome = ellipsis(p?.nome || '-', 28);
        const pos = p?.posicao || '-';
        return `<li style="margin:4px 0;"><span style=\"font-weight:700; color:${textMain}\">${nome}</span> <span style=\"color:${textSec}\">(${pos})</span></li>`;
      }).join('');

      const reservesList = reserves.map((p: any) => {
        const nome = ellipsis(p?.nome || '-', 28);
        const pos = p?.posicao || '-';
        return `<li style="margin:4px 0;"><span style=\"font-weight:700; color:${textMain}\">${nome}</span> <span style=\"color:${textSec}\">(${pos})</span></li>`;
      }).join('') || `<div style="color:${textSec}">—</div>`;

      // Datas, médias e arquivo
      const dt = new Date();
      const longDate = formatLongDate(dt);
      const formationName = this.currentFormationName();
      const avgAge = this.averageAge();
      const avgHeight = this.averageHeight();
      const avgRating = this.averageRating();

      // Container invisível
      console.log('[ExportPDF] Construindo container...');
      const container = document.createElement('div');
      container.id = 'pdf-export-temp';
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-1';
      container.style.width = '210mm';
      container.style.background = '#FFFFFF';

      // HTML do relatório minimalista
      container.innerHTML = `
        <div style="box-sizing:border-box; width:170mm; padding:12mm; margin:0 auto; font-family: Inter, Roboto, Arial, sans-serif; color:${textMain}; background:#FFFFFF;">
          <!-- Cabeçalho simplificado -->
          <div style="display:flex; align-items:flex-end; justify-content:space-between;">
            <div style="text-align:left;">
              <div style="font:700 14pt Inter, Roboto, Arial, sans-serif; color:${textMain};">Formação: ${formationName}</div>
            </div>
            <div style="text-align:right;">
              <div style="font:700 16pt Inter, Roboto, Arial, sans-serif; letter-spacing:.06em; text-transform:uppercase; color:${textMain};">RELATÓRIO TÁTICO</div>
              <div style="font:400 10pt Inter, Roboto, Arial, sans-serif; color:${textSec};">${longDate}</div>
            </div>
          </div>
          <div style="height:1px; background:${border}; margin:12px 0 12px;"></div>

          <!-- Campo tático -->
          <div style="height:140mm; width:100%; position:relative; overflow:visible; border:3px solid #15803d; border-radius:16px; background:linear-gradient(180deg,#22c55e 0%, #16a34a 50%, #22c55e 100%); box-shadow: inset 0 0 50px rgba(0,0,0,0.2), 0 0 30px rgba(34,197,94,0.1), 0 4px 20px rgba(0,0,0,0.2);">
            <!-- Área interna arredondada -->
            <div style="position:absolute; top:30px; left:30px; right:30px; bottom:30px; border-radius:12px; overflow:hidden; z-index:1;">
              <!-- Textura em quadriculado suave -->
              <div style="position:absolute; inset:0; background: linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 51%), linear-gradient(0deg, transparent 49%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 51%); background-size: 40px 40px;"></div>
              <!-- Linhas do campo -->
              <div style="position:absolute; inset:0;">
                <!-- Laterais -->
                <div style="position:absolute; left:0; right:0; top:0; height:3px; background:#FFFFFF;"></div>
                <div style="position:absolute; left:0; right:0; bottom:0; height:3px; background:#FFFFFF;"></div>
                <div style="position:absolute; top:0; bottom:0; left:0; width:3px; background:#FFFFFF;"></div>
                <div style="position:absolute; top:0; bottom:0; right:0; width:3px; background:#FFFFFF;"></div>
                <!-- Linha central -->
                <div style="position:absolute; top:50%; left:0; right:0; height:3px; background:#FFFFFF; transform:translateY(-50%);"></div>
                <!-- Círculo central -->
                <div style="position:absolute; top:50%; left:50%; width:120px; height:120px; border:3px solid #FFFFFF; border-radius:50%; transform:translate(-50%,-50%);"></div>
                <!-- Áreas e gols -->
                <div style="position:absolute; left:50%; top:0; width:200px; height:80px; border:3px solid #FFFFFF; border-top:none; transform:translateX(-50%);"></div>
                <div style="position:absolute; left:50%; top:0; width:80px; height:40px; border:3px solid #FFFFFF; border-top:none; transform:translateX(-50%);"></div>
                <div style="position:absolute; left:50%; bottom:0; width:200px; height:80px; border:3px solid #FFFFFF; border-bottom:none; transform:translateX(-50%);"></div>
                <div style="position:absolute; left:50%; bottom:0; width:80px; height:40px; border:3px solid #FFFFFF; border-bottom:none; transform:translateX(-50%);"></div>
                <!-- Marcas de pênalti -->
                <div style="position:absolute; left:50%; top:70px; width:8px; height:8px; background:#FFFFFF; border-radius:50%; transform:translateX(-50%);"></div>
                <div style="position:absolute; left:50%; bottom:70px; width:8px; height:8px; background:#FFFFFF; border-radius:50%; transform:translateX(-50%);"></div>
              </div>
            </div>
            <!-- Camada das posições (mesmo padding de 30px usado no TacticalField) -->
            <div style="position:absolute; top:30px; left:30px; right:30px; bottom:30px;">
              ${playersNodes}
            </div>
          </div>

          <!-- Bloco de estatísticas -->
          <div style="margin-top:16px; display:flex; align-items:stretch; justify-content:space-around; gap:12px;">
            <div style="flex:1; background:#F9F9F9; border-radius:6px; padding:12px; text-align:center;">
              <div style="font:400 8pt Inter, Roboto, Arial, sans-serif; color:${textSec}; letter-spacing:.06em; text-transform:uppercase;">Idade Média</div>
              <div style="margin-top:4px; font:700 14pt Inter, Roboto, Arial, sans-serif; color:${textMain};">${avgAge}</div>
            </div>
            <div style="width:1px; background:${border};"></div>
            <div style="flex:1; background:#F9F9F9; border-radius:6px; padding:12px; text-align:center;">
              <div style="font:400 8pt Inter, Roboto, Arial, sans-serif; color:${textSec}; letter-spacing:.06em; text-transform:uppercase;">Altura Média</div>
              <div style="margin-top:4px; font:700 14pt Inter, Roboto, Arial, sans-serif; color:${textMain};">${avgHeight}</div>
            </div>
            <div style="width:1px; background:${border};"></div>
            <div style="flex:1; background:#F9F9F9; border-radius:6px; padding:12px; text-align:center;">
              <div style="font:400 8pt Inter, Roboto, Arial, sans-serif; color:${textSec}; letter-spacing:.06em; text-transform:uppercase;">Avaliação Média</div>
              <div style="margin-top:4px; font:700 14pt Inter, Roboto, Arial, sans-serif; color:${textMain};">${avgRating}</div>
            </div>
          </div>

          <!-- Listas de jogadores (duas colunas) -->
          <div style="margin-top:20px; display:flex; gap:24px;">
            <div style="flex:1;">
              <div style="font:700 12pt Inter, Roboto, Arial, sans-serif; color:${textMain}; text-transform:uppercase;">Titulares (${placed.length})</div>
              <ol style="margin:8px 0 0; padding-left:16px; list-style:decimal inside; font:400 10pt Inter, Roboto, Arial, sans-serif; line-height:1.6; color:${textMain};">${titularesList}</ol>
            </div>
            <div style="flex:1;">
              <div style="font:700 12pt Inter, Roboto, Arial, sans-serif; color:${textMain}; text-transform:uppercase;">Suplentes (${reserves.length})</div>
              <ol style="margin:8px 0 0; padding-left:16px; list-style:decimal inside; font:400 10pt Inter, Roboto, Arial, sans-serif; line-height:1.6; color:${textMain};">${reservesList}</ol>
            </div>
          </div>

          <!-- Rodapé -->
          <div style="height:1px; background:${border}; margin:16px 0 8px;"></div>
          <div style="text-align:center; font:400 9pt Inter, Roboto, Arial, sans-serif; color:#999999;">Gerado por Scouting | scouting.local</div>
        </div>
      `;

      document.body.appendChild(container);
      console.log('[ExportPDF] Container anexado ao DOM');


      console.log('[ExportPDF] Carregando html2pdf...');

      const { default: html2pdf } = await import('html2pdf.js');
      const fileName = `relatorio-tatico-${this.safeFileName(formationName)}-${this.formatDate(new Date())}.pdf`;
      const opt: any = {
        margin: [20,20,20,20],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' },


        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css','avoid-all'] }
      };


      console.log('[ExportPDF] Aguardando pintura do DOM...');

      await new Promise<void>(res => requestAnimationFrame(() => res()));
      console.log('[ExportPDF] Gerando PDF...');

      const sourceEl = container.firstElementChild as HTMLElement || container;
      await (html2pdf() as any).set(opt).from(sourceEl).save();
      try { document.body.removeChild(container); } catch {}
      console.log('[ExportPDF] PDF gerado com sucesso');

      this.toast.success('O download foi iniciado.', 'Relatório Tático');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      this.toast.error('Não foi possível gerar o PDF.', 'Relatório Tático');
    }
  }

  private safeFileName(input: string): string {
    const noAccents = input ? input.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
    return noAccents.replace(/[^a-zA-Z0-9 _-]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s/g, '-');
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }



}
