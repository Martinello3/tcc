import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AvaliacaoCalculoService {
  // sinais 0..10 com 2 casas
  readonly notaFisica = signal<number>(0);
  readonly notaTecnica = signal<number>(0);
  readonly notaTatica = signal<number>(0);
  readonly notaFinal = signal<number>(0);

  recompute(form: any, posicao?: string | null) {
    const fis100 = this.calcFisica100(form?.dados_avaliacao?.fisica || []);
    const tec100 = this.calcTecnica100(form?.dados_avaliacao?.tecnica || []);
    const tat100 = this.calcTatica100(form?.dados_avaliacao?.tatica_comportamental || {});

    const fis10 = this.round2(fis100 / 10);
    const tec10 = this.round2(tec100 / 10);
    const tat10 = this.round2(tat100 / 10);

    const { wFis, wTec, wTat } = this.pesosPorPosicao(posicao || '');
    const final10 = this.round2(((fis100 * wFis) + (tec100 * wTec) + (tat100 * wTat)) / 10);

    this.notaFisica.set(fis10);
    this.notaTecnica.set(tec10);
    this.notaTatica.set(tat10);
    this.notaFinal.set(final10);
  }

  private round2(v: number) { return Math.round((v + Number.EPSILON) * 100) / 100; }

  private parseDecimal(s: any): number | null {
    if (s === null || s === undefined) return null;
    if (typeof s === 'number') return isFinite(s) ? s : null;
    const str = String(s).trim().replace(/\s+/g, '');
    if (!str) return null;
    // tenta com ponto e com vírgula
    const dot = Number(str.replace(',', '.'));
    return isNaN(dot) ? null : dot;
  }

  private calcFisica100(items: any[]): number {
    const xs: number[] = [];
    for (const t of items || []) {
      const s = this.normalizaFisico(String(t?.teste || ''), String(t?.tipo_teste || ''), String(t?.resultado || ''), String(t?.unidade || ''));
      if (s != null) xs.push(s);
    }
    if (!xs.length) return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }

  private calcTecnica100(items: any[]): number {
    const xs: number[] = [];
    for (const e of items || []) {
      const ac = Number(e?.acertos ?? 0);
      const tt = Math.max(1, Number(e?.tentativas ?? 0));
      xs.push((ac / tt) * 100);
    }
    if (!xs.length) return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }

  private calcTatica100(tc: any): number {
    const xs: number[] = [];
    const add = (v: any) => { const n = this.parseDecimal(v); if (n != null) xs.push(n * 10); };
    if (tc) {
      add(tc.posicionamento);
      add(tc.leitura_jogo);
      add(tc.tomada_decisao);
    }
    if (!xs.length) return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }

  private normalizaFisico(teste: string, tipo: string, resultado: string, unidade: string): number | null {
    const val = this.parseDecimal(resultado);
    if (val == null) return null;
    const t = (teste || '').toLowerCase();
    const u = (unidade || '').toLowerCase();

    const clamp01 = (x: number) => x < 0 ? 0 : (x > 1 ? 1 : x);
    const toPct = (v: number) => Math.round(v * 100 * 10000) / 10000;
    const lowerBetter = (min: number, max: number, v: number) => toPct(clamp01((max - v) / (max - min)));
    const higherBetter = (min: number, max: number, v: number) => toPct(clamp01((v - min) / (max - min)));

    if (t.includes('sprint') && u.includes('s')) {
      if (t.includes('30')) return lowerBetter(3.7, 5.5, val);
      if (t.includes('20')) return lowerBetter(2.8, 4.0, val);
      if (t.includes('10')) return lowerBetter(1.6, 2.2, val);
      if (t.includes('5'))  return lowerBetter(0.9, 1.5, val);
    }
    if (t.includes('illinois') || t.includes('teste t') || t.includes('shuttle') || t.includes('pro-agility')) {
      return lowerBetter(14.0, 20.0, val);
    }
    if (t.includes('1600') && (u.includes('min') || u.includes('s'))) {
      const sec = u.includes('min') ? val * 60 : val;
      return lowerBetter(270, 420, sec);
    }
    if (t.includes('cooper') && u.includes('m')) {
      return higherBetter(1800, 3000, val);
    }
    if (t.includes('velocidade máxima') || t.includes('velocidade maxima') || (u.includes('km/h') || u.includes('kmh'))) {
      return higherBetter(24, 36, val);
    }
    if (t.includes('cmj') || t.includes('salto vertical') || (u.includes('cm') && t.includes('salto'))) {
      return higherBetter(30, 70, val);
    }
    if (t.includes('plank') || t.includes('prancha')) {
      return higherBetter(60, 240, val);
    }
    if (t.includes('abdominais') || t.includes('flexões')) {
      return higherBetter(20, 70, val);
    }
    if (t.includes('medicine') || t.includes('arremesso') || (u.includes('m') && t.includes('arremesso'))) {
      return higherBetter(3, 8, val);
    }
    return null;
  }

  private pesosPorPosicao(posicao: string): { wFis: number; wTec: number; wTat: number } {
    const p = (posicao || '').toLowerCase();
    if (!p) return { wFis: 0.30, wTec: 0.45, wTat: 0.25 };
    if (p.includes('goleiro') || p.includes('goalkeeper')) return { wFis: 0.45, wTec: 0.25, wTat: 0.30 };
    if (p.includes('zagueiro') || p.includes('lateral') || p.includes('def')) return { wFis: 0.30, wTec: 0.35, wTat: 0.35 };
    if (p.includes('volante') || p.includes('meia') || p.includes('meio') || p.includes('mid')) return { wFis: 0.25, wTec: 0.45, wTat: 0.30 };
    if (p.includes('atacante') || p.includes('ponta') || p.includes('centroavante') || p.includes('forward')) return { wFis: 0.30, wTec: 0.50, wTat: 0.20 };
    return { wFis: 0.30, wTec: 0.45, wTat: 0.25 };
  }
}

