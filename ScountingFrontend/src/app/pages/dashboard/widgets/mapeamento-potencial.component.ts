import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AvaliacoesService } from '../../../services/avaliacoes.service';
import { JogadoresService } from '../../../services/jogadores.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTooltip, ApexTheme, ApexPlotOptions, ApexFill, ApexStroke, ApexLegend, ApexDataLabels } from 'ng-apexcharts';

type PeriodCode = '30d' | '6m' | 'all';
interface Counts { elite: number; altoPotencial: number; emObservacao: number; recemAdicionados: number; total: number; }

const CATEGORIES: { key: keyof Omit<Counts,'total'>; label: string; color: string }[] = [
  { key: 'elite', label: 'Elite', color: '#10B981' },
  { key: 'altoPotencial', label: 'Alto Potencial', color: '#3B82F6' },
  { key: 'emObservacao', label: 'Em Observação', color: '#F59E0B' },
  { key: 'recemAdicionados', label: 'Recém Adicionados', color: '#D1D5DB' },
];

@Component({
  selector: 'app-mapeamento-potencial-widget',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  styles: [`
    .card-head { position: relative; }
    .filter-select { min-width: 180px; }
    .muted { color: var(--text-muted, #6b7280); }
    .donut-wrap { position: relative; min-height: 200px; }
    .fade-out { opacity: .35; filter: blur(.2px); transform: scale(.995); transition: opacity .2s ease, filter .2s ease, transform .2s ease; }
    .fade-in { animation: donutFadeIn .6s ease-out; }
    @keyframes donutFadeIn { from { opacity:.01; transform:scale(.98);} to { opacity:1; transform:scale(1);} }
    .skeleton { display:grid; place-items:center; min-height: 200px; }
    .skel-circle { width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.6), transparent 40%), var(--border, #e5e7eb); animation: pulse 1.2s infinite ease-in-out; }
    @keyframes pulse { 0%,100%{ opacity:.6 } 50%{ opacity:1 } }
    :host-context(body.dark) .skel-circle { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.08), transparent 40%), rgba(255,255,255,.06); }
    .empty { text-align:center; padding:28px 0; opacity:.85; }
    /* Forçar textos da legenda do ApexCharts a ficarem brancos no tema escuro */
    :host ::ng-deep .apexcharts-legend-text { color: #ffffff !important; fill: #ffffff !important; opacity: 1 !important; }
  `],
  template: `
  <div class="card h-100">
    <div class="card-body">
      <div class="mb-1 card-head">
        <h5 class="m-0"><i class="bi bi-pie-chart-fill" style="color:#10B981"></i> Distribuição de Talentos</h5>
        <div class="mt-2" style="max-width: 220px;">
          <select class="form-select form-select-sm filter-select" style="border:1px solid var(--border); background: var(--bg-elevated, transparent); color: inherit;" [value]="period()" (change)="onPeriodChange(($any($event.target)).value)">
            <option value="30d">Últimos 30 dias</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="all">Desde o início</option>
          </select>
        </div>
      </div>


      @if (loading()) {
        <div class="skeleton"><div class="skel-circle"></div></div>
      } @else if (error()) {
        <div class="text-danger small">{{ error() }}</div>
      } @else if (counts().total === 0) {
        <div class="empty">
          <i class="bi bi-pie-chart" style="font-size:48px; opacity:.3;"></i>
          <div class="fw-semibold mt-2">Nenhum jogador cadastrado ainda</div>
        </div>
      } @else {
        <div class="donut-wrap" [class.fade-out]="transitioning() && !loading()" [class.fade-in]="justLoaded()">
          <apx-chart
            [series]="series()"
            [chart]="chartOptions.chart"
            [labels]="chartOptions.labels"
            [colors]="chartOptions.colors"
            [tooltip]="chartOptions.tooltip"
            [theme]="chartOptions.theme"
            [plotOptions]="chartOptions.plotOptions"
            [responsive]="chartOptions.responsive">
          </apx-chart>
        </div>
      }
    </div>
  </div>
  `
})
export class MapeamentoPotencialWidgetComponent implements OnInit {
  private avalSvc = inject(AvaliacoesService);
  private jogSvc = inject(JogadoresService);

  private readonly LS_KEY = 'talents-donut-period';

  loading = signal(true);
  error = signal<string | null>(null);
  period = signal<PeriodCode>(this.getSavedPeriod());
  transitioning = signal(false);
  justLoaded = signal(false);

  counts = signal<Counts>({ elite:0, altoPotencial:0, emObservacao:0, recemAdicionados:0, total:0 });
  series = signal<ApexNonAxisChartSeries>([0,0,0,0]);

  chartOptions: { chart: ApexChart; labels: string[]; colors: string[]; tooltip: ApexTooltip; theme: ApexTheme; plotOptions: ApexPlotOptions; responsive: ApexResponsive[]; fill?: ApexFill; stroke?: ApexStroke; legend?: ApexLegend; dataLabels?: ApexDataLabels; states?: any } =
    { chart:{} as ApexChart, labels:[], colors:[], tooltip:{} as ApexTooltip, theme:{} as ApexTheme, plotOptions:{} as ApexPlotOptions, responsive:[] };

  ngOnInit(): void {
    this.initChartOptions();
    this.load(this.period());

    // observar mudanças de tema via body.dark
    try {
      const obs = new MutationObserver(() => this.applyTheme());
      obs.observe(document.body, { attributes:true, attributeFilter:['class'] });
    } catch {}
  }

  onPeriodChange(v: string) {
    const val: PeriodCode = v==='6m' ? '6m' : (v==='all' ? 'all' : '30d');
    this.period.set(val);
    try { localStorage.setItem(this.LS_KEY, val); } catch {}
    this.transitioning.set(true);
    setTimeout(() => this.load(val), 200);
  }

  private getSavedPeriod(): PeriodCode {
    try { const v = localStorage.getItem(this.LS_KEY) as PeriodCode | null; if (v==='30d'||v==='6m'||v==='all') return v; } catch {}
    return '30d';
  }

  private initChartOptions() {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDark = typeof document !== 'undefined' && document.body.classList.contains('dark');
    const textColor = isDark ? '#e5e7eb' : '#111827';
    const strokeColor = isDark ? '#1f2937' : '#ffffff';
    this.chartOptions = {
      chart: { type:'donut', height: 220, background: 'transparent', animations:{ enabled: !prefersReduced, speed:800 }, toolbar:{ show:false } },
      labels: CATEGORIES.map(c => c.label),
      colors: CATEGORIES.map(c => c.color),
      tooltip: {
        y: { formatter: (val: number) => {
          const total = this.counts().total || 1;
          const pct = (val / total) * 100;
          return `${val} jogadores (${pct.toFixed(1)}%)`;
        }}
      },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'bottom', horizontalAlign: 'center', fontSize: '12px', labels: { colors: '#ffffff' }, itemMargin: { horizontal: 10, vertical: 4 }, offsetY: -12, onItemHover: { highlightDataSeries: false }, onItemClick: { toggleDataSeries: true },
        formatter: (seriesName: string, opts?: any) => {
          try {
            const idx = opts?.seriesIndex ?? 0;
            const val = Number(this.series()[idx] || 0);
            const total = this.counts().total || 0;
            const pct = total ? (val / total) * 100 : 0;
            const plural = val === 1 ? 'jogador' : 'jogadores';
            const maxName = 20; // aproxima alinhamento com "dots"
            const gap = Math.max(2, maxName - seriesName.length);
            const dots = '.'.repeat(gap);
            return `${seriesName} ${dots} ${val} ${plural} (${pct.toFixed(1)}%)`;
          } catch {
            return seriesName;
          }
        }
      },
      theme: { mode: isDark ? 'dark' : 'light' },
      states: { hover: { filter: { type: 'lighten', value: 0.1 } } },
      fill: { opacity: 1 },
      stroke: { show: true, width: 3, colors: [strokeColor] },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: true, fontWeight: 700, fontSize: '30px', color: '#ffffff', formatter: () => `${this.counts().total}` },
              total: { show: true, showAlways: true, label: 'Total de Jogadores', fontSize: '12px', color: '#ffffff', formatter: () => `${this.counts().total}` }
            }
          },
          expandOnClick: false
        }
      },
      responsive: [
        { breakpoint: 768, options: { chart: { width: '100%' }, plotOptions: { pie: { donut: { size: '72%' } } } } }
      ]
    };
  }

  private applyTheme() {
    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#e5e7eb' : '#111827';
    this.chartOptions = {
      ...this.chartOptions,
      theme: { mode: isDark ? 'dark' : 'light' },
      legend: { ...(this.chartOptions.legend as any), labels: { colors: '#ffffff' }, position: 'bottom', horizontalAlign: 'center', offsetY: -12, itemMargin: { horizontal: 10, vertical: 4 } },
      stroke: { ...(this.chartOptions.stroke as any), show: true, width: 3, colors: [isDark ? '#1f2937' : '#ffffff'] },
      plotOptions: {
        ...this.chartOptions.plotOptions,
        pie: {
          ...this.chartOptions.plotOptions.pie,
          donut: {
            ...this.chartOptions.plotOptions.pie?.donut,
            labels: {
              ...this.chartOptions.plotOptions.pie?.donut?.labels,
              value: { ...(this.chartOptions.plotOptions.pie?.donut?.labels as any)?.value, color: '#ffffff' },
              name: { ...(this.chartOptions.plotOptions.pie?.donut?.labels as any)?.name, color: '#ffffff' },
              total: { ...(this.chartOptions.plotOptions.pie?.donut?.labels as any)?.total, color: '#ffffff' }
            }
          }
        }
      }
    };
  }

  private inPeriod(d: Date, periodo: PeriodCode): boolean {
    if (periodo === 'all') return true;
    const now = new Date();
    if (periodo === '30d') { const min = new Date(now); min.setDate(min.getDate()-30); min.setHours(0,0,0,0); return d >= min; }
    const min = new Date(now); min.setMonth(min.getMonth()-6); min.setHours(0,0,0,0); return d >= min;
  }

  private bucketFromNota(n: number): keyof Omit<Counts,'total'> {
    if (n >= 8) return 'elite';
    if (n >= 7) return 'altoPotencial';
    if (n >= 5) return 'emObservacao';
    return 'recemAdicionados';
  }

  async load(periodo: PeriodCode) {
    try {
      this.loading.set(true);
      this.error.set(null);

      const jogadores = await firstValueFrom(this.jogSvc.list());
      const counts: Counts = { elite:0, altoPotencial:0, emObservacao:0, recemAdicionados:0, total:0 };

      if (!jogadores || jogadores.length === 0) {
        this.counts.set(counts);
        this.series.set([0,0,0,0]);
        this.loading.set(false);
        this.transitioning.set(false);
        this.justLoaded.set(true); setTimeout(()=>this.justLoaded.set(false), 600);
        return;
      }

      const tasks = jogadores.map(async (j: any) => {
        const list = await firstValueFrom(this.avalSvc.byJogador(j.id));
        const arr = (list||[]).sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());
        const latest = arr[0];
        if (!latest) { counts.recemAdicionados++; counts.total++; return; }
        const d = new Date(latest.data);
        if (!this.inPeriod(d, periodo)) { counts.recemAdicionados++; counts.total++; return; }
        const nota = latest?.notaFinal ?? j?.notaGeral ?? null;
        if (nota == null || isNaN(Number(nota))) { counts.recemAdicionados++; counts.total++; return; }
        const bucket = this.bucketFromNota(Number(nota));
        counts[bucket]++; counts.total++;
      });

      await Promise.all(tasks);

      this.counts.set(counts);
      this.series.set([
        counts.elite,
        counts.altoPotencial,
        counts.emObservacao,
        counts.recemAdicionados
      ]);

      this.initChartOptions();

      this.loading.set(false);
      this.transitioning.set(false);
      this.justLoaded.set(true); setTimeout(()=>this.justLoaded.set(false), 600);
    } catch (e) {
      this.error.set('Não foi possível carregar os dados do período selecionado.');
      this.loading.set(false);
      this.transitioning.set(false);
    }
  }
}

