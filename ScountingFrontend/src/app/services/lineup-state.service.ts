import { Injectable, signal, computed } from '@angular/core';

export interface LineupPlayer {
  positionId: string;
  playerId?: number;
  player?: any;
}

@Injectable({ providedIn: 'root' })
export class LineupStateService {
  // Formação atual (sincronizada com o TacticalField)
  readonly currentFormationId = signal<string>('4-3-3');
  // Jogadores posicionados no campo (sincronizados com o TacticalField)
  readonly playersInFormation = signal<LineupPlayer[]>([]);

  // Ids de jogadores já usados no campo
  readonly usedPlayerIds = computed(() =>
    this.playersInFormation()
      .map(p => p.playerId)
      .filter((id): id is number => typeof id === 'number')
  );

  setFormation(id: string) {
    this.currentFormationId.set(id);
  }

  setPlayers(players: LineupPlayer[]) {
    this.playersInFormation.set(players || []);
  }

  clear() {
    this.playersInFormation.set([]);
  }
}

