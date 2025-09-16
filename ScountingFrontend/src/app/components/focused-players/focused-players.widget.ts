import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JogadoresService } from '../../services/jogadores.service';
import { AuthService } from '../../auth/auth.service';
import type { Jogador } from '../../models/player';

@Component({
  selector: 'app-focused-players-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
  .scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5rem 0;
    margin: 0 -0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .players-row {
    display: flex;
    gap: 1rem;
    min-width: max-content;
  }
  .player-card {
    position: relative;
    width: 140px;
    height: 180px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid var(--border);
  }
  .player-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  .player-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }
  .player-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
    z-index: 2;
  }
  .player-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    z-index: 3;
    color: white;
  }
  .player-name {
    font-weight: 600;
    font-size: 0.9rem;
    line-height: 1.2;
    margin-bottom: 0.25rem;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }
  .player-info {
    font-size: 0.75rem;
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
  .club-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    background: white;
    border: 2px solid rgba(255,255,255,0.8);
    z-index: 3;
  }
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--text-muted);
  }
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  .muted { color: var(--text-muted); }
  `],
  template: `
  <div class="card h-100">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="m-0"><i class="bi bi-binoculars text-success"></i> Meus Jogadores em Foco</h5>
        <a class="text-decoration-none small" [routerLink]="['/jogadores']">Ver todos</a>
      </div>

      @if (!userId) {
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <div>Entre para ver seus favoritos.</div>
        </div>
      } @else if (loading) {
        <div class="empty-state">
          <div class="empty-icon">⌛</div>
          <div>Carregando...</div>
        </div>
      } @else if (!favoritos.length) {
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <div class="fw-semibold">Ainda não há jogadores em foco.</div>
          <div class="muted">Visite o perfil de um atleta e clique na estrela ⭐ para acompanhá-lo por aqui.</div>
        </div>
      } @else {
        <div class="scroll-container" (wheel)="onWheel($event)">
          <div class="players-row">
            @for (p of favoritos; track p.id) {
              <a class="player-card text-decoration-none" [routerLink]="['/jogadores', p.id, 'perfil']">
                <img class="player-bg" [src]="imgSrc(p.foto) || '/brand/user-placeholder.png'" alt="foto" />
                <div class="player-overlay"></div>
                <img *ngIf="p.clubeAtual?.foto" class="club-badge" [src]="imgSrc(p.clubeAtual?.foto) || ''" alt="clube" />
                <div class="player-content">
                  <div class="player-name">{{ p.nome }}</div>
                  <div class="player-info">{{ idade(p.dataNascimento) }} anos • {{ p.posicao || '-' }}</div>
                </div>
              </a>
            }
          </div>
        </div>
      }
    </div>
  </div>
  `
})
export class FocusedPlayersWidgetComponent implements OnInit {
  private api = inject(JogadoresService);
  private auth = inject(AuthService);

  userId: number | null = null;
  favoritos: Jogador[] = [];
  loading = false;

  ngOnInit(): void {
    this.userId = this.auth.user()?.id ?? null;
    if (!this.userId) return;
    this.refresh();
  }

  refresh() {
    if (!this.userId) return;
    this.loading = true;
    this.api.favoritos(this.userId).subscribe({ next: (list) => { this.favoritos = (list || []).slice(0, 15); this.loading = false; }, error: () => { this.loading = false; } });
  }

  onWheel(e: WheelEvent) {
    const el = e.currentTarget as HTMLElement | null;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  }

  unfavorite(p: Jogador) {
    if (!this.userId || !p?.id) return;
    this.api.toggleFavorito(p.id, this.userId).subscribe({ next: () => this.refresh() });
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

