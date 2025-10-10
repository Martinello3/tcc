import { Component, Signal, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerCardComponent } from './player-card.component';
import { FormationsService } from '../../services/formations.service';
import { JogadoresFacade } from '../../facades/jogadores.facade';
import { NotificationService } from '../../services/notification.service';
import { FormationStorageService } from '../../services/formation-storage.service';
import { LineupStateService } from '../../services/lineup-state.service';

export interface TacticalPosition { id: string; label: string; x: number; y: number; zones: string[]; }
export interface Formation { id: string; name: string; positions: TacticalPosition[]; description: string; }
export interface PlayerInFormation { playerId?: number; positionId: string; player?: any; }

@Component({
  selector: 'app-tactical-field',
  standalone: true,
  imports: [CommonModule, PlayerCardComponent],
  template: `
    <div class="tactical-field-container">
      <div class="formation-controls">
        <div class="controls-top">
          <label class="form-label">
            <i class="bi bi-diagram-3"></i> Formação Tática
          </label>
          <select class="fifa-select" (change)="changeFormation($event)">
            <option *ngFor="let formation of formations()" [value]="formation.id">
              {{ formation.name }} - {{ formation.description }}
            </option>
          </select>
        </div>
        <div class="controls-bottom">
          <button class="fifa-btn fifa-btn-outline" title="Exportar PDF (em breve)">
            <i class="bi bi-filetype-pdf"></i>
            <span class="btn-text">Exportar PDF</span>
          </button>
          <button class="fifa-btn fifa-btn-outline" (click)="resetFormation()" title="Redefinir Posições">
            <i class="bi bi-arrow-clockwise"></i>
            <span class="btn-text">Redefinir</span>
          </button>
        </div>
      </div>

      <div class="football-field" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <div class="field-background-rounded">
          <div class="field-background">
            <div class="field-lines">
              <div class="sideline sideline-top"></div>
              <div class="sideline sideline-bottom"></div>
              <div class="sideline sideline-left"></div>
              <div class="sideline sideline-right"></div>
              <div class="center-line"></div>
              <div class="center-circle"></div>
              <div class="penalty-area penalty-area-top"></div>
              <div class="goal-area goal-area-top"></div>
              <div class="penalty-area penalty-area-bottom"></div>
              <div class="goal-area goal-area-bottom"></div>
              <div class="penalty-spot penalty-spot-top"></div>
              <div class="penalty-spot penalty-spot-bottom"></div>
            </div>
          </div>
          <div class="zone-labels">
            <div class="zone-label attack-zone">ATAQUE</div>
            <div class="zone-label midfield-zone">MEIO-CAMPO</div>
            <div class="zone-label defense-zone">DEFESA</div>
          </div>
          <div class="tactical-positions">
            <div *ngFor="let position of currentFormation().positions"
                 class="position-slot"
                 [attr.data-pos]="position.id"
                 [class.occupied]="getPlayerInPosition(position.id)"
                 [class.highlighted]="highlightedPosition() === position.id"
                 [style.--x]="position.x + '%'"
                 [style.--y]="position.y + '%'"
                 (dragover)="onPositionDragOver($event, position.id)"
                 (dragleave)="onPositionDragLeave(position.id)"
                 (drop)="onPositionDrop($event, position.id)"
                 (click)="selectPosition(position.id)">
              <app-player-card
                *ngIf="getPlayerInPosition(position.id) as playerInPos"
                [player]="playerInPos.player"
                [isOnField]="true"
                [isSelected]="false"
                (dragStart)="onPlayerDragStart(playerInPos, $event)"
                class="field-player-card">
              </app-player-card>
              <button type="button" class="remove-overlay" title="Remover jogador" (click)="removePlayer(position.id, $event)">
                <i class="bi bi-x-circle-fill"></i>
              </button>
              <div *ngIf="!getPlayerInPosition(position.id)" class="empty-slot">
                <div class="position-label">{{ position.label }}</div>
                <div class="add-player-icon"><i class="bi bi-plus-circle"></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Most tactical field styles moved to global styles.scss */
    .tactical-field-container { height: 100%; padding: 20px; display: flex; flex-direction: column; }
    .formation-controls { margin-bottom: 24px; }
    .position-slot { position: absolute; }
    .position-slot.occupied:hover .remove-overlay { display: flex; }
    .remove-overlay { position: absolute; top: -6px; right: -6px; width: 28px; height: 28px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.55); color: #10B981; cursor: pointer; z-index: 3; border: none; }
    .remove-overlay i { font-size: 18px; line-height: 1; }

    .controls-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .controls-top .form-label { margin: 0; white-space: nowrap; }
    .controls-bottom { margin-top: 8px; display: flex; gap: 12px; flex-wrap: wrap; }
  `]
})
export class TacticalFieldComponent {
  private formationsService = inject(FormationsService);
  public jogadoresFacade = inject(JogadoresFacade);
  private notificationService = inject(NotificationService);
  private formationStorageService = inject(FormationStorageService);
  private lineupState = inject(LineupStateService);

  private autoSaveEnabled = signal(true);
  private hasUnsavedChanges = signal(false);

  formations = this.formationsService.formations;
  currentFormationId = signal('4-3-3');
  playersInFormation = signal<PlayerInFormation[]>([]);
  highlightedPosition = signal<string | null>(null);
  draggedPlayer = signal<PlayerInFormation | null>(null);

  currentFormation = computed(() => {
    const formations = this.formations() as Formation[];
    return formations.find((f: Formation) => f.id === this.currentFormationId()) || formations[0];
  });

  availablePlayers = computed(() => {
    const allPlayers = this.jogadoresFacade.items();
    const usedPlayerIds = this.playersInFormation().map(p => p.playerId).filter(id => id);
    return allPlayers.filter(player => !usedPlayerIds.includes(player.id))
      .map(player => ({ ...player, notaFinalMedia: player.notaGeral || 0, stats: { pace: Math.floor(Math.random() * 100), shooting: Math.floor(Math.random() * 100), passing: Math.floor(Math.random() * 100) } }));
  });

  constructor() {
    this.jogadoresFacade.load();
    effect(() => { const players = this.playersInFormation(); if (players.length > 0 && this.autoSaveEnabled()) { this.hasUnsavedChanges.set(true); } });
    effect(() => { const fid = this.currentFormationId(); this.lineupState.setFormation(fid); });
    effect(() => { const players = this.playersInFormation(); this.lineupState.setPlayers(players); });
    this.initializeFormation();
    setTimeout(() => { this.loadCurrentState(); }, 100);
  }

  initializeFormation() {
    const formation = this.currentFormation();
    const initialPlayers: PlayerInFormation[] = formation.positions.map(pos => ({ positionId: pos.id, playerId: undefined, player: undefined }));
    this.playersInFormation.set(initialPlayers);
  }

  changeFormation(event: any) {
    this.saveCurrentState();
    const newFormationId = event.target.value;
    this.currentFormationId.set(newFormationId);
    this.initializeFormation();
    setTimeout(() => { this.loadCurrentState(); }, 50);
  }

  getPlayerInPosition(positionId: string): PlayerInFormation | null {
    const players = this.playersInFormation().filter(p => p.positionId === positionId && p.playerId);
    if (players.length > 1) { this.cleanupDuplicatePositions(positionId); return players[0]; }
    return players[0] || null;
  }

  private cleanupDuplicatePositions(positionId: string) {
    this.playersInFormation.update(currentPlayers => {
      const playersInPosition = currentPlayers.filter(p => p.positionId === positionId && p.playerId);
      if (playersInPosition.length <= 1) return currentPlayers;
      const playerToKeep = playersInPosition[0];
      const otherPositions = currentPlayers.filter(p => !(p.positionId === positionId && p.playerId));
      return [...otherPositions, playerToKeep];
    });
  }

  private validateAndCleanupFormation() {
    this.playersInFormation.update(currentPlayers => {
      const validPlayers = currentPlayers.filter(p => p.positionId && (p.playerId || !p.player));
      const playerGroups = validPlayers.reduce((acc, player) => { if (player.playerId) { if (!acc[player.playerId]) acc[player.playerId] = []; acc[player.playerId].push(player); } return acc; }, {} as Record<number, PlayerInFormation[]>);
      const cleanedPlayers = validPlayers.filter((player) => { if (!player.playerId) return true; const group = playerGroups[player.playerId]; return group && group[0] === player; });
      return cleanedPlayers;
    });
  }

  selectPosition(positionId: string) { this.highlightedPosition.set(positionId); }

  onDragOver(event: DragEvent) { event.preventDefault(); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.highlightedPosition.set(null);
    const draggedPlayer = this.draggedPlayer();
    if (draggedPlayer && draggedPlayer.positionId) {
      this.playersInFormation.update(players => players.filter(p => p.playerId !== draggedPlayer.playerId));
    }
    this.draggedPlayer.set(null);
  }

  onPositionDragOver(event: DragEvent, positionId: string) { event.preventDefault(); this.highlightedPosition.set(positionId); }
  onPositionDragLeave(positionId: string) { this.highlightedPosition.set(null); }

  onPositionDrop(event: DragEvent, positionId: string) {
    event.preventDefault();
    this.highlightedPosition.set(null);
    let draggedPlayer = this.draggedPlayer();
    if (!draggedPlayer && event.dataTransfer) { try { const dragData = event.dataTransfer.getData('text/plain'); if (dragData) { draggedPlayer = JSON.parse(dragData); } } catch (e) { console.error('Erro ao processar dados do drag:', e); return; } }
    if (!draggedPlayer) return;
    const playerId = draggedPlayer.playerId; if (!playerId) return;
    const currentPlayers = this.playersInFormation();
    const existingPlayerInPosition = currentPlayers.find(p => p.positionId === positionId && p.playerId === playerId);
    if (existingPlayerInPosition) { this.draggedPlayer.set(null); return; }
    this.playersInFormation.update(currentPlayers => {
      const playersWithoutDragged = currentPlayers.filter(p => p.playerId !== playerId);
      const playersWithoutTarget = playersWithoutDragged.filter(p => p.positionId !== positionId);
      const playerAlreadyExists = playersWithoutTarget.some(p => p.playerId === playerId && p.positionId === positionId);
      if (playerAlreadyExists) { return currentPlayers; }
      return [...playersWithoutTarget, { playerId: playerId, positionId: positionId, player: draggedPlayer!.player }];
    });
    this.draggedPlayer.set(null);
    setTimeout(() => this.validateAndCleanupFormation(), 10);
    this.hasUnsavedChanges.set(true);
    this.saveCurrentState();
  }

  onPlayerDragStart(playerInFormation: PlayerInFormation, event: DragEvent) {
    this.draggedPlayer.set(playerInFormation);
    if (event.dataTransfer) { event.dataTransfer.setData('text/plain', JSON.stringify(playerInFormation)); event.dataTransfer.effectAllowed = 'move'; }
  }

  removePlayer(positionId: string, event?: MouseEvent) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    try {
      this.playersInFormation.update(currentPlayers =>
        currentPlayers.map(p => p.positionId === positionId ? ({ positionId: p.positionId, playerId: undefined, player: undefined }) : p)
      );
      this.hasUnsavedChanges.set(true);
      this.saveCurrentState();
    } catch (e) {
      console.error('Erro ao remover jogador da posição:', e);
    }
  }

  resetFormation() {
    try {
      const fid = this.currentFormationId();
      this.initializeFormation();
      const storageKey = `formation-state-${fid}`;
      localStorage.removeItem(storageKey);
      this.hasUnsavedChanges.set(false);
      this.notificationService.showInfo('Forma e7 e3o redefinida', 'Todas as posi e7 f5es foram esvaziadas.');
    } catch (e) { console.error('Erro ao redefinir forma e7 e3o:', e); }
  }

  private saveCurrentState() {
    try {
      const playersWithData = this.playersInFormation().filter(p => p.player && p.playerId);
      const formationState = { formationId: this.currentFormationId(), players: playersWithData, timestamp: new Date().toISOString() };
      const storageKey = `formation-state-${this.currentFormationId()}`;
      localStorage.setItem(storageKey, JSON.stringify(formationState));
      localStorage.setItem('last-formation-id', this.currentFormationId());
      this.hasUnsavedChanges.set(false);
    } catch (error) { console.error('Erro ao salvar estado:', error); }
  }

  private loadCurrentState() {
    try {
      const storageKey = `formation-state-${this.currentFormationId()}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.players && data.players.length > 0) {
          const currentPositions = this.currentFormation().positions;
          const mergedPlayers = currentPositions.map(pos => { const savedPlayer = data.players.find((p: any) => p.positionId === pos.id); return savedPlayer || { positionId: pos.id, playerId: undefined, player: undefined }; });
          this.playersInFormation.set(mergedPlayers);
          setTimeout(() => this.validateAndCleanupFormation(), 10);
        }
      }
    } catch (error) { console.error('Erro ao carregar estado:', error); }
  }
}

