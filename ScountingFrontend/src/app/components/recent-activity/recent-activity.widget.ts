import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityItem } from '../../services/activity.service';

@Component({
  selector: 'app-recent-activity-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .card { background-color: #121416; color: #e9ecef; border: 1px solid rgba(255,255,255,0.06); }
    .card-header { border-bottom: 1px solid rgba(255,255,255,0.06); }
    .list-item { display:flex; justify-content:space-between; gap:12px; padding:10px 0; }
    .list-item + .list-item { border-top: 1px dashed rgba(255,255,255,0.08); }
    .entity { color: #22c55e; font-weight: 600; }
    a.item-link { text-decoration: none; color: inherit; }
    a.item-link:hover .entity { text-decoration: underline; }
  `],
  template: `
  <div class="card shadow-sm h-100">
    <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
      <div class="fw-semibold"><i class="bi bi-clock-history text-success"></i> Atividade Recente</div>
      <div class="small text-muted">\Últimas 5</div>
    </div>
    <div class="card-body">
      @if (loading()) {
        <div class="text-muted small">Carregando atividades...</div>
      } @else if (items().length === 0) {
        <div class="text-muted text-center py-3">Nenhuma atividade recente para exibir.</div>
      } @else {
        <div>
          @for (item of items(); track item.timestamp + item.url) {
            <a class="item-link" [routerLink]="item.url">
              <div class="list-item">
                <div class="me-2">
                  <span [innerHTML]="renderDescription(item)"></span>
                </div>
                <div class="text-nowrap small text-muted">{{ relativeTime(item.timestamp) }}</div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  </div>
  `
})
export class RecentActivityWidgetComponent {
  private svc = inject(ActivityService);

  loading = signal(true);
  items = signal<ActivityItem[]>([]);

  constructor() {
    this.svc.recent(5).subscribe({
      next: (list) => { this.items.set(list); this.loading.set(false); },
      error: () => { this.items.set([]); this.loading.set(false); }
    });
  }

  renderDescription(item: ActivityItem): string {
    const safeName = this.escapeHtml(item.entityName);
    switch (item.type) {
      case 'AVALIACAO_CONCLUIDA':
        return `Avaliação concluída para <span class="entity">${safeName}</span>`;
      case 'RELATORIO_GERADO':
        return `Relatório gerado para <span class=\"entity\">${safeName}</span>`;
      case 'VIDEO_ENVIADO':
        return `Vídeo enviado para <span class=\"entity\">${safeName}</span>`;
      default:
        return `<span class=\"entity\">${safeName}</span>`;
    }
  }

  relativeTime(iso: string): string {
    const now = new Date();
    const d = new Date(iso);
    const diffMs = now.getTime() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 10) return 'agora mesmo';
    if (sec < 60) return `há ${sec} segundos`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `há ${min} minuto${min>1?'s':''}`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `há ${hr} hora${hr>1?'s':''}`;
    const day = Math.floor(hr / 24);
    if (day === 1) return 'ontem';
    return `há ${day} dias`;
  }

  private escapeHtml(s: string): string {
    const map: Record<string,string> = { '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;' };
    return s.replace(/[&<>"']/g, (c) => map[c]);
  }
}

