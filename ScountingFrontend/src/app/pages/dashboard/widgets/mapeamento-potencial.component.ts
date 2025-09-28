import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AvaliacoesService } from '../../../services/avaliacoes.service';
import { JogadoresService } from '../../../services/jogadores.service';
import type { Avaliacao } from '../../../models/avaliacao';

interface DayPoint { date: Date; key: string; elite: number; promising: number; observe: number; total: number; }

@Component({
  selector: 'app-mapeamento-potencial-widget',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .muted { color: var(--text-muted); }
    .chart-wrap { position: relative; width: 100%; height: 260px; }
    svg { width: 100%; height: 100%; display: block; }
    .legend-floating { position:absolute; top:8px; right:8px; background: rgba(255,255,255,.85); color:#0b0f14; border:1px solid var(--border); border-radius: 8px; padding: 6px 8px; display:flex; gap:10px; align-items:center; }
    :host-context(body.dark) .legend-floating { background: rgba(17,24,39,.75); color: #e5e7eb; border-color: rgba(255,255,255,.12); }
    .legend-item { display:inline-flex; align-items:center; gap:6px; cursor:pointer; user-select:none; font-size: .82rem; font-weight:600; }
    .legend-item.inactive { opacity:.45; text-decoration: line-through; }
    .dot { width: 10px; height: 10px; border-radius: 2px; display:inline-block; }
    .tooltip { position: absolute; pointer-events: none; background: #111827; color: #e5e7eb; border: 1px solid rgba(255,255,255,.12); padding: .5rem .6rem; border-radius: .5rem; font-size: .8rem; white-space: nowrap; transform: translate(-50%, -115%); }
    .axis-label { font-size: 10px; fill: currentColor; opacity: .7; }
  `],
  template: `
  <div class="card h-100">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="m-0"><i class="bi bi-graph-up-arrow text-success"></i> Mapeamento de Potencial</h5>
      </div>
      <div class="small muted mb-3">Visão geral por categoria — gráfico único (últimos 30 dias)</div>
      @if (loading()) {
        <div class="muted">Carregando dados...</div>
      } @else if (error()) {
        <div class="text-danger small">{{ error() }}</div>
      } @else if (noData()) {
        <div class="muted">Sem avaliações nos últimos 30 dias.</div>
      } @else {
        <div class="d-flex justify-content-end align-items-center gap-3 mb-2 legend-row">
          <span class="legend-item" [class.inactive]="!showElite" (click)="toggle('elite')" title="Jogadores Elite: desempenho excepcional (nota final >= 8.0)">
            <span class="dot" [style.background]="colors.elite"></span> Elite
          </span>
          <span class="legend-item" [class.inactive]="!showPromising" (click)="toggle('promising')" title="Jogadores Promissores: em ascensão (nota final entre 7.0 e 7.9)">
            <span class="dot" [style.background]="colors.promising"></span> Promissores
          </span>
          <span class="legend-item" [class.inactive]="!showObserve" (click)="toggle('observe')" title="Em Observação: acompanhar evolução (nota final abaixo de 7.0)">
            <span class="dot" [style.background]="colors.observe"></span> Observação
          </span>
        </div>

        <div class="chart-wrap" (mousemove)="onMove($event)" (mouseleave)="tooltipVisible=false">
          <svg [attr.viewBox]="'0 0 ' + vbW + ' ' + vbH" preserveAspectRatio="none">
            <g>
              <line x1="40" [attr.y1]="vbH-30" [attr.x2]="vbW-10" [attr.y2]="vbH-30" stroke="rgba(0,0,0,.15)" />
              <line x1="40" y1="16" x2="40" [attr.y2]="vbH-30" stroke="rgba(0,0,0,.15)" />
              @for (t of yTicks(); track t) {
                <line x1="40" [attr.y1]="yPos(t)" [attr.x2]="vbW-10" [attr.y2]="yPos(t)" stroke="rgba(0,0,0,.06)" />
                <text class="axis-label" text-anchor="end" x="38" [attr.y]="yPos(t)+3">{{ t }}</text>
              }
              @for (i of xTicksIdx(); track i) {
                <line [attr.x1]="xAt(i)" y1="16" [attr.x2]="xAt(i)" [attr.y2]="vbH-30" stroke="rgba(0,0,0,.04)" />
                <text class="axis-label" text-anchor="middle" [attr.x]="xAt(i)" [attr.y]="vbH-16">{{ dateLabel(i) }}</text>
              }
            </g>
            @if (showObserve) { <path [attr.d]="linePath('observe')" [attr.stroke]="colors.observe" stroke-width="2" fill="none"></path> }
            @if (showPromising) { <path [attr.d]="linePath('promising')" [attr.stroke]="colors.promising" stroke-width="2" fill="none"></path> }
            @if (showElite) { <path [attr.d]="linePath('elite')" [attr.stroke]="colors.elite" stroke-width="2" fill="none"></path> }
          </svg>
          @if (tooltipVisible) {
            <div class="tooltip" [style.left.px]="tooltipX" [style.top.px]="tooltipY">
              <div class="fw-semibold">{{ hoverDate }}</div>
              <div><span class="dot" [style.background]="colors.elite"></span> Elite: {{ hoverElite }}</div>
              <div><span class="dot" [style.background]="colors.promising"></span> Promissores: {{ hoverPromising }}</div>
              <div><span class="dot" [style.background]="colors.observe"></span> Observação: {{ hoverObserve }}</div>
              <div class="mt-1">Total: {{ hoverTotal }}</div>
            </div>
          }
        </div>
      }
    </div>
  </div>
  `
})
export class MapeamentoPotencialWidgetComponent implements OnInit {
  private avalSvc = inject(AvaliacoesService);
  private jogSvc = inject(JogadoresService);

  loading = signal(true);
  error = signal<string | null>(null);

  // last 30 days (ascending)
  private days: Date[] = [];
  private dayKeys: string[] = [];

  points = signal<DayPoint[]>([]);
  maxY = signal(0);

  readonly colors = {
    elite: '#F59E0B',      // gold
    promising: '#3B82F6',  // blue
    observe: '#6B7280'     // gray
  } as const;

  // svg viewbox
  vbW = 900;
  vbH = 240;

  tooltipVisible = false;
  tooltipX = 0; tooltipY = 0;
  hoverDate = '';
  hoverElite = 0; hoverPromising = 0; hoverObserve = 0; hoverTotal = 0;

  ngOnInit(): void {
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0,0,0,0);
      this.days.push(d);
      this.dayKeys.push(this.key(d));
    }
    this.load();
  }

  private async load() {
    try {
      this.loading.set(true);
      const jogadores = await firstValueFrom(this.jogSvc.list());
      const lastDate = this.days[this.days.length-1];
      const firstDate = this.days[0];
      const latestByPlayer: Map<number, Avaliacao> = new Map();

      const promises = (jogadores || []).map(async j => {
        const list = await firstValueFrom(this.avalSvc.byJogador(j.id));
        const arr = (list || []).filter(a => {
          const d = new Date(a.data);
          return d >= firstDate && d <= new Date(lastDate.getTime() + 24*3600*1000 - 1);
        }).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        if (arr.length > 0) latestByPlayer.set(j.id, arr[0]);
      });
      await Promise.all(promises);

      // Build counts by day for latest evaluation per player
      const dayAdditions = new Map<string, { elite: number; promising: number; observe: number }>();
      this.dayKeys.forEach(k => dayAdditions.set(k, { elite:0, promising:0, observe:0 }));

      latestByPlayer.forEach(a => {
        const k = this.key(new Date(a.data));
        const nota = (a.notaFinal ?? 0);
        const bucket = nota >= 8 ? 'elite' : (nota >= 7 ? 'promising' : 'observe');
        const obj = dayAdditions.get(k);
        if (obj) (obj as any)[bucket]++;
      });

      // cumulative step counts
      const pts: DayPoint[] = [];
      let cumElite = 0, cumProm = 0, cumObs = 0;
      for (const d of this.days) {
        const k = this.key(d);
        const add = dayAdditions.get(k)!;
        cumElite += add.elite;
        cumProm += add.promising;
        cumObs += add.observe;
        const total = cumElite + cumProm + cumObs;
        pts.push({ date: new Date(d), key: k, elite: cumElite, promising: cumProm, observe: cumObs, total });
      }
      const max = pts.reduce((m,p)=> Math.max(m, p.total), 0);
      this.maxY.set(Math.max(1, max));
      this.points.set(pts);
      this.loading.set(false);
    } catch (e) {
      this.error.set('Falha ao carregar dados');
      this.loading.set(false);
    }
  }

  private key(d: Date) { return d.toISOString().substring(0,10); }


  // Series visibility toggles
  showElite = true; showPromising = true; showObserve = true;

  // Helpers for unified chart
  private seriesVal(p: DayPoint, s: 'elite'|'promising'|'observe') { return s==='elite'?p.elite : s==='promising'?p.promising : p.observe; }
  private left = 40; private top = 16;
  private right() { return this.vbW - 10; }
  private bottom() { return this.vbH - 30; }
  xAt(i: number): number { const pts = this.points(); const w = this.right() - this.left; const n = Math.max(pts.length - 1, 1); return this.left + (w / n) * i; }
  yPos(value: number): number { const h = this.bottom() - this.top; const max = this.maxY(); return this.bottom() - (value / max) * h; }
  yFor(s: 'elite'|'promising'|'observe', i: number): number { const p = this.points()[i]; return this.yPos(this.seriesVal(p, s)); }
  linePath(s: 'elite'|'promising'|'observe'): string { const pts = this.points(); if (!pts.length) return ''; let d = `M ${this.xAt(0)} ${this.yFor(s,0)}`; for (let i=1;i<pts.length;i++){ d += ` L ${this.xAt(i)} ${this.yFor(s,i-1)}`; d += ` L ${this.xAt(i)} ${this.yFor(s,i)}`; } return d; }

  xTicksIdx = computed(() => { const pts = this.points(); const idxs: number[] = []; for (let i=0;i<pts.length;i++){ if (i === 0 || i === pts.length-1 || i % 5 === 0) idxs.push(i);} return idxs; });
  yTicks = computed(() => { const max = this.maxY(); const steps = 4; const step = Math.max(1, Math.ceil(max/steps)); const arr:number[] = []; for (let v=0; v<=max; v+=step) arr.push(v); if (arr[arr.length-1] !== max) arr.push(max); return arr; });
  dateLabel(i: number): string { const p = this.points()[i]; if (!p) return ''; const d = p.date; const day = String(d.getDate()).padStart(2,'0'); const month = String(d.getMonth()+1).padStart(2,'0'); return `${day}/${month}`; }
  toggle(s: 'elite'|'promising'|'observe') { if (s==='elite') this.showElite = !this.showElite; else if (s==='promising') this.showPromising = !this.showPromising; else this.showObserve = !this.showObserve; }



  noData(): boolean { return this.points().length > 0 ? this.points().every(p => p.total === 0) : true; }

  onMove(e: MouseEvent) {
    const host = (e.currentTarget as HTMLElement);
    const rect = host.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const left = 40, right = rect.width - 10; // approximate to DOM size
    const w = right - left;
    const idx = Math.max(0, Math.min(this.points().length - 1, Math.round(((x - left) / w) * (this.points().length - 1))));
    const p = this.points()[idx];
    if (!p) { this.tooltipVisible = false; return; }
    this.tooltipVisible = true;
    this.tooltipX = e.clientX - rect.left; // relative
    this.tooltipY = 40; // fixed offset from top of chart area
    this.hoverDate = p.date.toLocaleDateString('pt-BR');
    this.hoverElite = p.elite;
    this.hoverPromising = p.promising;
    this.hoverObserve = p.observe;
    this.hoverTotal = p.total;
  }
}

