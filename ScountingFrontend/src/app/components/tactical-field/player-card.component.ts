import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-card"
         [class.on-field]="isOnField"
         [class.on-bench]="!isOnField"
         draggable="true"
         (dragstart)="onDragStart($event)">
      
      <!-- Card FIFA Style -->
      <div class="card-inner">
        <!-- Header com Overall/Rating -->
        <div class="card-header">
          <div class="overall-rating" *ngIf="!isOnField">
            {{ player?.notaFinalMedia || '--' }}
          </div>
          <div class="position-badge" *ngIf="!isOnField">
            {{ player?.posicao || 'N/A' }}
          </div>
        </div>

        <!-- Foto do Jogador -->
        <div class="player-photo">
          <img [src]="playerPhotoUrl" 
               [alt]="player?.nome"
               (error)="onImageError($event)">
          
          <!-- Efeito de brilho FIFA -->
          <div class="shine-effect"></div>
        </div>

        <!-- Informações do Jogador -->
        <div class="player-info">
          <div class="player-name">{{ player?.nome }}</div>
          <div class="player-details" *ngIf="!isOnField">
            <div class="detail-row">
              <span class="label">Idade:</span>
              <span class="value">{{ calculateAge() }}</span>
            </div>
            <div class="detail-row" *ngIf="player?.altura">
              <span class="label">Alt:</span>
              <span class="value">{{ player.altura }}m</span>
            </div>
            <div class="detail-row" *ngIf="player?.clubeAtual?.nome">
              <span class="label">Clube:</span>
              <span class="value">{{ player.clubeAtual.nome }}</span>
            </div>
            <div class="detail-row" *ngIf="player?.nacionalidade">
              <span class="label">País:</span>
              <span class="value">{{ player.nacionalidade }}</span>
            </div>
          </div>
          
          <!-- Número da camisa -->
          <div class="shirt-number" *ngIf="player?.numero || player?.id">
            #{{ player?.numero || player?.id }}
          </div>
        </div>

        <!-- Stats bars (versão compacta) -->
        <div class="stats-bars" *ngIf="!isOnField && player?.stats">
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(player.stats.pace || 0)"></div>
            <span class="stat-value">{{ player.stats.pace || 0 }}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(player.stats.shooting || 0)"></div>
            <span class="stat-value">{{ player.stats.shooting || 0 }}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(player.stats.passing || 0)"></div>
            <span class="stat-value">{{ player.stats.passing || 0 }}</span>
          </div>
        </div>

        <!-- Indicadores especiais -->
        <div class="special-indicators">
          <!-- Jogador favorito -->
          <div class="indicator favorite" *ngIf="player?.isFavorite">
            <i class="bi bi-star-fill"></i>
          </div>
          
          <!-- Destaque/Performance -->
          <div class="indicator performance" 
               [class]="getPerformanceClass()"
               *ngIf="player?.notaFinalMedia">
            <i class="bi" [ngClass]="getPerformanceIcon()"></i>
          </div>
          
          <!-- Status de lesão -->
          <div class="indicator injury" *ngIf="player?.hasInjury">
            <i class="bi bi-bandaid"></i>
          </div>
        </div>

        <!-- Efeito hover/seleção -->
        <div class="card-glow" [class.active]="isSelected"></div>
      </div>
    </div>
  `,
  styles: [`
    /* Player card styles moved to global styles.scss */
    .player-card { cursor: grab; }
  `]
})
export class PlayerCardComponent {
  @Input() player: any;
  @Input() position?: any;
  @Input() isOnField: boolean = false;
  @Input() isSelected: boolean = false;
  
  @Output() dragStart = new EventEmitter<DragEvent>();

  get playerPhotoUrl(): string {
    if (this.player?.foto) {
      if (this.player.foto.startsWith('http')) {
        return this.player.foto;
      }
      return `http://localhost:5180${this.player.foto}`;
    }
    return '/assets/images/default-player.svg';
  }

  calculateAge(): number {
    if (!this.player?.dataNascimento) return 0;
    const birthDate = new Date(this.player.dataNascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getPerformanceClass(): string {
    const rating = this.player?.notaFinalMedia || 0;
    if (rating >= 8.5) return 'excellent';
    if (rating >= 7.0) return 'good';
    if (rating >= 5.5) return 'average';
    return 'poor';
  }

  getPerformanceIcon(): string {
    const rating = this.player?.notaFinalMedia || 0;
    if (rating >= 8.5) return 'bi-trophy-fill';
    if (rating >= 7.0) return 'bi-star-fill';
    if (rating >= 5.5) return 'bi-circle-fill';
    return 'bi-arrow-down-circle-fill';
  }

  onDragStart(event: DragEvent) {
    this.dragStart.emit(event);
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/default-player.svg';
  }
}

