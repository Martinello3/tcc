import { Injectable, signal } from '@angular/core';
import { Formation, TacticalPosition } from '../components/tactical-field/tactical-field.component';

@Injectable({
  providedIn: 'root'
})
export class FormationsService {
  
  private readonly formationsData: Formation[] = [
    {
      id: '4-3-3',
      name: '4-3-3',
      description: 'Formação ofensiva clássica',
      positions: [
        // Goleiro
        { id: 'gk', label: 'GK', x: 50, y: 92, zones: ['defense'] },
        
        // Defesa (4 jogadores)
        { id: 'lb', label: 'LB', x: 15, y: 70, zones: ['defense'] },
        { id: 'cb1', label: 'CB', x: 35, y: 75, zones: ['defense'] },
        { id: 'cb2', label: 'CB', x: 65, y: 75, zones: ['defense'] },
        { id: 'rb', label: 'RB', x: 85, y: 70, zones: ['defense'] },
        
        // Meio-campo (3 jogadores)
        { id: 'cdm', label: 'CDM', x: 50, y: 55, zones: ['midfield'] },
        { id: 'cm1', label: 'CM', x: 25, y: 45, zones: ['midfield'] },
        { id: 'cm2', label: 'CM', x: 75, y: 45, zones: ['midfield'] },
        
        // Ataque (3 jogadores)
        { id: 'lw', label: 'LW', x: 20, y: 25, zones: ['attack'] },
        { id: 'st', label: 'ST', x: 50, y: 15, zones: ['attack'] },
        { id: 'rw', label: 'RW', x: 80, y: 25, zones: ['attack'] }
      ]
    },
    {
      id: '4-4-2',
      name: '4-4-2',
      description: 'Formação equilibrada clássica',
      positions: [
        // Goleiro
        { id: 'gk', label: 'GK', x: 50, y: 92, zones: ['defense'] },
        
        // Defesa (4 jogadores)
        { id: 'lb', label: 'LB', x: 15, y: 70, zones: ['defense'] },
        { id: 'cb1', label: 'CB', x: 35, y: 75, zones: ['defense'] },
        { id: 'cb2', label: 'CB', x: 65, y: 75, zones: ['defense'] },
        { id: 'rb', label: 'RB', x: 85, y: 70, zones: ['defense'] },
        
        // Meio-campo (4 jogadores)
        { id: 'lm', label: 'LM', x: 20, y: 45, zones: ['midfield'] },
        { id: 'cm1', label: 'CM', x: 38, y: 50, zones: ['midfield'] },
        { id: 'cm2', label: 'CM', x: 62, y: 50, zones: ['midfield'] },
        { id: 'rm', label: 'RM', x: 80, y: 45, zones: ['midfield'] },
        
        // Ataque (2 jogadores)
        { id: 'st1', label: 'ST', x: 38, y: 20, zones: ['attack'] },
        { id: 'st2', label: 'ST', x: 62, y: 20, zones: ['attack'] }
      ]
    },
    {
      id: '3-5-2',
      name: '3-5-2',
      description: 'Controle do meio-campo',
      positions: [
        // Goleiro
        { id: 'gk', label: 'GK', x: 50, y: 92, zones: ['defense'] },
        
        // Defesa (3 jogadores)
        { id: 'cb1', label: 'CB', x: 25, y: 75, zones: ['defense'] },
        { id: 'cb2', label: 'CB', x: 50, y: 77, zones: ['defense'] },
        { id: 'cb3', label: 'CB', x: 75, y: 75, zones: ['defense'] },
        
        // Meio-campo (5 jogadores)
        { id: 'lwb', label: 'LWB', x: 10, y: 55, zones: ['midfield'] },
        { id: 'cdm', label: 'CDM', x: 50, y: 60, zones: ['midfield'] },
        { id: 'cm1', label: 'CM', x: 30, y: 45, zones: ['midfield'] },
        { id: 'cm2', label: 'CM', x: 70, y: 45, zones: ['midfield'] },
        { id: 'rwb', label: 'RWB', x: 90, y: 55, zones: ['midfield'] },
        
        // Ataque (2 jogadores)
        { id: 'st1', label: 'ST', x: 38, y: 20, zones: ['attack'] },
        { id: 'st2', label: 'ST', x: 62, y: 20, zones: ['attack'] }
      ]
    },
    {
      id: '4-2-3-1',
      name: '4-2-3-1',
      description: 'Formação moderna equilibrada',
      positions: [
        // Goleiro
        { id: 'gk', label: 'GK', x: 50, y: 92, zones: ['defense'] },
        
        // Defesa (4 jogadores)
        { id: 'lb', label: 'LB', x: 15, y: 70, zones: ['defense'] },
        { id: 'cb1', label: 'CB', x: 35, y: 75, zones: ['defense'] },
        { id: 'cb2', label: 'CB', x: 65, y: 75, zones: ['defense'] },
        { id: 'rb', label: 'RB', x: 85, y: 70, zones: ['defense'] },
        
        // Meio-campo defensivo (2 jogadores)
        { id: 'cdm1', label: 'CDM', x: 38, y: 57, zones: ['midfield'] },
        { id: 'cdm2', label: 'CDM', x: 62, y: 57, zones: ['midfield'] },
        
        // Meio-campo ofensivo (3 jogadores)
        { id: 'lam', label: 'LAM', x: 20, y: 35, zones: ['midfield', 'attack'] },
        { id: 'cam', label: 'CAM', x: 50, y: 30, zones: ['midfield', 'attack'] },
        { id: 'ram', label: 'RAM', x: 80, y: 35, zones: ['midfield', 'attack'] },
        
        // Ataque (1 jogador)
        { id: 'st', label: 'ST', x: 50, y: 15, zones: ['attack'] }
      ]
    },
    {
      id: '5-3-2',
      name: '5-3-2',
      description: 'Formação defensiva sólida',
      positions: [
        // Goleiro
        { id: 'gk', label: 'GK', x: 50, y: 92, zones: ['defense'] },
        
        // Defesa (5 jogadores)
        { id: 'lwb', label: 'LWB', x: 10, y: 65, zones: ['defense'] },
        { id: 'cb1', label: 'CB', x: 25, y: 75, zones: ['defense'] },
        { id: 'cb2', label: 'CB', x: 50, y: 77, zones: ['defense'] },
        { id: 'cb3', label: 'CB', x: 75, y: 75, zones: ['defense'] },
        { id: 'rwb', label: 'RWB', x: 90, y: 65, zones: ['defense'] },
        
        // Meio-campo (3 jogadores)
        { id: 'cm1', label: 'CM', x: 30, y: 45, zones: ['midfield'] },
        { id: 'cm2', label: 'CM', x: 50, y: 50, zones: ['midfield'] },
        { id: 'cm3', label: 'CM', x: 70, y: 45, zones: ['midfield'] },
        
        // Ataque (2 jogadores)
        { id: 'st1', label: 'ST', x: 38, y: 20, zones: ['attack'] },
        { id: 'st2', label: 'ST', x: 62, y: 20, zones: ['attack'] }
      ]
    },
    {
      id: '3-4-3',
      name: '3-4-3',
      description: 'Formação ofensiva intensa',
      positions: [
        // Goleiro
        { id: 'gk', label: 'GK', x: 50, y: 92, zones: ['defense'] },
        
        // Defesa (3 jogadores)
        { id: 'cb1', label: 'CB', x: 25, y: 75, zones: ['defense'] },
        { id: 'cb2', label: 'CB', x: 50, y: 77, zones: ['defense'] },
        { id: 'cb3', label: 'CB', x: 75, y: 75, zones: ['defense'] },
        
        // Meio-campo (4 jogadores)
        { id: 'lm', label: 'LM', x: 15, y: 45, zones: ['midfield'] },
        { id: 'cm1', label: 'CM', x: 38, y: 50, zones: ['midfield'] },
        { id: 'cm2', label: 'CM', x: 62, y: 50, zones: ['midfield'] },
        { id: 'rm', label: 'RM', x: 85, y: 45, zones: ['midfield'] },
        
        // Ataque (3 jogadores)
        { id: 'lw', label: 'LW', x: 20, y: 25, zones: ['attack'] },
        { id: 'st', label: 'ST', x: 50, y: 15, zones: ['attack'] },
        { id: 'rw', label: 'RW', x: 80, y: 25, zones: ['attack'] }
      ]
    }
  ];

  formations = signal<Formation[]>(this.formationsData);

  constructor() {}

  getFormationById(id: string): Formation | undefined {
    return this.formationsData.find(f => f.id === id);
  }

  getPositionsByZone(formationId: string, zone: 'defense' | 'midfield' | 'attack'): TacticalPosition[] {
    const formation = this.getFormationById(formationId);
    if (!formation) return [];
    
    return formation.positions.filter(pos => pos.zones.includes(zone));
  }

  validateFormation(formationId: string, playerPositions: any[]): { isValid: boolean; errors: string[] } {
    const formation = this.getFormationById(formationId);
    if (!formation) {
      return { isValid: false, errors: ['Formação não encontrada'] };
    }

    const errors: string[] = [];
    
    // Verifica se todas as posições obrigatórias estão preenchidas
    const requiredPositions = formation.positions.filter(pos => pos.id === 'gk' || pos.zones.includes('defense'));
    const filledPositions = playerPositions.filter(p => p.playerId);
    
    if (filledPositions.length < 11) {
      errors.push('É necessário escalar 11 jogadores');
    }

    // Verifica se há goleiro
    const hasGoalkeeper = playerPositions.some(p => p.positionId === 'gk' && p.playerId);
    if (!hasGoalkeeper) {
      errors.push('É obrigatório ter um goleiro');
    }

    // Verifica duplicação
    const playerIds = playerPositions.filter(p => p.playerId).map(p => p.playerId);
    const uniquePlayerIds = [...new Set(playerIds)];
    if (playerIds.length !== uniquePlayerIds.length) {
      errors.push('Não é possível escalar o mesmo jogador em múltiplas posições');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Método para personalizar formações
  createCustomFormation(name: string, positions: TacticalPosition[]): Formation {
    const customId = `custom-${Date.now()}`;
    return {
      id: customId,
      name: name,
      description: 'Formação personalizada',
      positions: positions
    };
  }

  // Método para salvar formação personalizada
  saveCustomFormation(formation: Formation): void {
    const currentFormations = this.formations();
    const updatedFormations = [...currentFormations, formation];
    this.formations.set(updatedFormations);
    
    // Salvar no localStorage para persistência
    localStorage.setItem('customFormations', JSON.stringify(updatedFormations));
  }

  // Método para carregar formações personalizadas
  loadCustomFormations(): void {
    const stored = localStorage.getItem('customFormations');
    if (stored) {
      try {
        const customFormations = JSON.parse(stored) as Formation[];
        const currentFormations = this.formations();
        const allFormations = [...currentFormations, ...customFormations];
        this.formations.set(allFormations);
      } catch (error) {
        console.error('Erro ao carregar formações personalizadas:', error);
      }
    }
  }

  // Análise tática da formação
  analyzeFormation(formationId: string): {
    offensivePower: number;
    defensiveSolidity: number;
    midfieldControl: number;
    width: number;
    balance: number;
  } {
    const formation = this.getFormationById(formationId);
    if (!formation) {
      return { offensivePower: 0, defensiveSolidity: 0, midfieldControl: 0, width: 0, balance: 0 };
    }

    const defenseCount = formation.positions.filter(p => p.zones.includes('defense')).length;
    const midfieldCount = formation.positions.filter(p => p.zones.includes('midfield')).length;
    const attackCount = formation.positions.filter(p => p.zones.includes('attack')).length;

    // Cálculo de largura baseado na dispersão horizontal dos jogadores
    const xPositions = formation.positions.map(p => p.x);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const width = ((maxX - minX) / 100) * 100; // Normalizado para 0-100

    return {
      offensivePower: Math.min(100, (attackCount * 25) + (midfieldCount * 15)),
      defensiveSolidity: Math.min(100, (defenseCount * 20) + (midfieldCount * 10)),
      midfieldControl: Math.min(100, midfieldCount * 20),
      width: width,
      balance: Math.min(100, 100 - Math.abs((attackCount - defenseCount) * 15))
    };
  }
}

