import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AvaliacaoCalculoService {
  // sinais 0..10 com 2 casas
  readonly notaFisica = signal<number>(0);
  readonly notaTecnica = signal<number>(0);
  readonly notaTatica = signal<number>(0);
  // Nota Final pode ser nula (avaliação parcial)
  readonly notaFinal = signal<number | null>(null);

  recompute(form: any, posicao?: string | null) {
    const fisArr = form?.dados_avaliacao?.fisica || [];
    const tecArr = form?.dados_avaliacao?.tecnica || [];
    const tatObj = form?.dados_avaliacao?.tatica_comportamental || {};

    const fisRes = this.calcFisica100_withCompleteness(fisArr);
    const tecRes = this.calcTecnica100_withCompleteness(tecArr);
    const tatRes = this.calcTatica100_withCompleteness(tatObj);

    const fis100 = fisRes.value100;
    const tec100 = tecRes.value100;
    const tat100 = tatRes.value100;

    const fis10 = this.round2(fis100 / 10);
    const tec10 = this.round2(tec100 / 10);
    const tat10 = this.round2(tat100 / 10);

    const { wFis, wTec, wTat } = this.pesosPorPosicao(posicao || '');
    const isComplete = fisRes.hasData && tecRes.hasData && tatRes.hasData;
    const final10 = isComplete ? this.round2(((fis100 * wFis) + (tec100 * wTec) + (tat100 * wTat)) / 10) : null;

    this.notaFisica.set(fis10);
    this.notaTecnica.set(tec10);
    this.notaTatica.set(tat10);
    this.notaFinal.set(final10);
  }

  private round2(v: number) { return Math.round((v + Number.EPSILON) * 100) / 100; }

  private calcFisica100_withCompleteness(items: any[]): { value100: number; hasData: boolean } {
    const xs: number[] = [];
    let hasPositive = false;
    for (const t of items || []) {
      const s = this.normalizaFisico(String(t?.teste || ''), String(t?.tipo_teste || ''), String(t?.resultado || ''), String(t?.unidade || ''));
      if (s != null) {
        xs.push(s);
        if (s > 0) hasPositive = true;
      }
    }
    const value100 = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    return { value100, hasData: hasPositive };
  }

  private calcTecnica100_withCompleteness(items: any[]): { value100: number; hasData: boolean } {
    const xs: number[] = [];
    let hasValid = false;
    for (const e of items || []) {
      const ac = Number(e?.acertos);
      const tt = Number(e?.tentativas);
      if (Number.isFinite(ac) && Number.isFinite(tt) && tt > 0) {
        const acClamped = Math.max(0, Math.min(ac, tt));
        const pct = (acClamped / tt) * 100;
        xs.push(pct);
        hasValid = true;
      }
    }
    const value100 = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    return { value100, hasData: hasValid };
  }

  private calcTatica100_withCompleteness(tc: any): { value100: number; hasData: boolean } {
    const xs: number[] = [];
    let hasPositive = false;
    const add = (v: any) => {
      const n = this.parseDecimal(v);
      if (n != null) {
        xs.push(n * 10);
        if (n > 0) hasPositive = true;
      }
    };
    if (tc) {
      add(tc.posicionamento);
      add(tc.leitura_jogo);
      add(tc.tomada_decisao);
    }
    const value100 = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    return { value100, hasData: hasPositive };
  }

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

    // helpers
    const clamp01 = (x: number) => x < 0 ? 0 : (x > 1 ? 1 : x);
    const toPct = (v: number) => Math.round(v * 100 * 10000) / 10000;
    const lowerBetter = (optimal: number, poor: number, v: number) => toPct(clamp01((poor - v) / (poor - optimal))); // lower is better
    const higherBetter = (poor: number, optimal: number, v: number) => toPct(clamp01((v - poor) / (optimal - poor))); // higher is better
    const has = (s: string, ks: string[]) => ks.some(k => s.includes(k));

    // -----------------------------
    // SPEED (lower is better)
    // -----------------------------
    if (t.includes('sprint') && u.includes('s')) {
      if (t.includes('30')) return lowerBetter(3.7, 5.5, val);
      if (t.includes('20')) return lowerBetter(2.8, 4.0, val);
      if (t.includes('10')) return lowerBetter(1.6, 2.2, val);
      if (t.includes('5'))  return lowerBetter(0.9, 1.5, val);
    }
    if (t.includes('rast')) {
      return lowerBetter(5.0, 6.5, val);
    }

    // -----------------------------
    // AGILITY (lower is better)
    // -----------------------------
    if (t.includes('teste t') || has(t, ['t test', 't-teste'])) {
      return lowerBetter(14.0, 20.0, val);
    }
    if (t.includes('illinois')) {
      return lowerBetter(14.0, 20.0, val);
    }
    if (has(t, ['shuttle', 'pro-agility', '5-10-5', '5 10 5'])) {
      return lowerBetter(4.2, 5.5, val);
    }
    if (has(t, ['zigue', 'zig-zag', 'zigzag'])) {
      return lowerBetter(12.0, 18.0, val);
    }

    // -----------------------------
    // RESISTANCE
    // -----------------------------
    if (has(t, ['yo-yo', 'yoyo']) && (t.includes('ir1') || t.includes('ir 1'))) {
      return higherBetter(15.0, 21.0, val);
    }
    if (has(t, ['yo-yo', 'yoyo']) && (t.includes('ir2') || t.includes('ir 2'))) {
      return higherBetter(18.0, 25.0, val);
    }
    if (t.includes('cooper') && u.includes('m')) {
      return higherBetter(1800, 3000, val);
    }
    if (has(t, ['t-car', 'navete', 'tcar'])) {
      return higherBetter(40, 80, val);
    }
    if (t.includes('1600') && (u.includes('min') || u.includes('s'))) {
      const sec = u.includes('min') ? val * 60 : val;
      return lowerBetter(270, 420, sec);
    }

    // -----------------------------
    // SPEED TOP END / GPS (higher better)
    // -----------------------------
    if (has(t, ['velocidade máxima', 'velocidade maxima']) || (u.includes('km/h') || u.includes('kmh'))) {
      return higherBetter(24, 36, val);
    }

    // -----------------------------
    // STRENGTH & POWER (higher better)
    // -----------------------------
    if (t.includes('cmj') || t.includes('salto vertical') || (u.includes('cm') && t.includes('salto'))) {
      return higherBetter(30, 70, val);
    }
    if (t.includes('salto horizontal') || (t.includes('salto') && u.includes('m'))) {
      return higherBetter(1.8, 2.8, val);
    }
    if (t.includes('plank') || t.includes('prancha')) {
      return higherBetter(60, 240, val);
    }
    if (has(t, ['abdominais', 'flexões', 'flexoes'])) {
      return higherBetter(20, 70, val);
    }
    if (has(t, ['medicine', 'arremesso'])) {
      return higherBetter(3, 8, val);
    }

    // -----------------------------
    // FLEXIBILITY (higher better)
    // -----------------------------
    if (has(t, ['sentar e alcançar', 'sentar e alcancar', 'sit and reach'])) {
      return higherBetter(5, 25, val);
    }
    if (has(t, ['mobilidade do tornozelo', 'tornozelo'])) {
      return higherBetter(8, 20, val);
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

