import { Injectable, computed, inject, signal } from '@angular/core';
import { JogadoresService } from '../services/jogadores.service';
import type { Jogador, JogadorUpsert } from '../models/player';
import { finalize } from 'rxjs/operators';

export type SortDir = 'asc' | 'desc';


export type AgeRangeCode = 'ATE_15' | '16_18' | '19_21' | 'ACIMA_21';
export interface JogadoresFilterState {
  posicoes: string[];
  pes: string[];
  ageRanges: AgeRangeCode[];
}

@Injectable({ providedIn: 'root' })
export class JogadoresFacade {
  private api = inject(JogadoresService);

  // State
  readonly items = signal<Jogador[]>([]);
  readonly loading = signal(false);
  readonly removingId = signal<number | null>(null);

  // Filtros múltiplos (multi-select)
  readonly filters = signal<JogadoresFilterState>({ posicoes: [], pes: [], ageRanges: [] });

  readonly sortKey = signal<keyof Jogador>('nome');
  readonly sortDir = signal<SortDir>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly total = computed(() => this.items().length);

  readonly filtered = computed(() => {
    const { posicoes, pes, ageRanges } = this.filters();
    const posSet = new Set((posicoes || []).map(v => (v || '').toLowerCase()));
    const pesSet = new Set((pes || []).map(v => (v || '').toLowerCase()));
    const ageSet = new Set(ageRanges || []);

    return this.items().filter(j => {
      // Posição (OR dentro da categoria)
      if (posSet.size > 0) {
        const jp = (j.posicao || '').toLowerCase();
        let ok = false;
        for (const opt of posSet) { if (jp.includes(opt)) { ok = true; break; } }
        if (!ok) return false;
      }
      // Pé dominante (OR dentro da categoria)
      if (pesSet.size > 0) {
        const pf = (j.peDominante || '').toLowerCase();
        let ok = false;
        for (const opt of pesSet) { if (pf.includes(opt)) { ok = true; break; } }
        if (!ok) return false;
      }
      // Faixa etária (OR dentro da categoria)
      if (ageSet.size > 0) {
        const age = (() => {
          const d = j.dataNascimento ? new Date(j.dataNascimento) : null;
          if (!d || isNaN(d.getTime())) return null as number | null;
          const today = new Date();
          let a = today.getFullYear() - d.getFullYear();
          const m = today.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
          return a;
        })();
        if (age == null) return false;
        let code: AgeRangeCode | null = null;
        if (age <= 15) code = 'ATE_15';
        else if (age >= 16 && age <= 18) code = '16_18';
        else if (age >= 19 && age <= 21) code = '19_21';
        else if (age > 21) code = 'ACIMA_21';
        if (!code || !ageSet.has(code)) return false;
      }
      return true; // AND entre categorias (já que retornamos false quando falha)
    });
  });

  readonly sorted = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    return [...this.filtered()].sort((a, b) => {
      const av = (a[key] ?? '') as any;
      const bv = (b[key] ?? '') as any;
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  readonly displayed = computed(() => {
    const p = this.page();
    const ps = this.pageSize();
    const start = (p - 1) * ps;
    return this.sorted().slice(start, start + ps);
  });

  load() {
    this.loading.set(true);
    this.api.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.items.set(res),
        error: () => this.items.set([])
      });
  }

  setFilters(partial: Partial<JogadoresFilterState>) {
    this.filters.update(f => ({ ...f, ...partial }));
    this.page.set(1);
  }

  clearFilters() {
    this.filters.set({ posicoes: [], pes: [], ageRanges: [] });
    this.page.set(1);
  }

  sortBy(key: keyof Jogador) {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  nextPage() {
    const max = Math.ceil(this.filtered().length / this.pageSize());
    if (this.page() < max) this.page.update(v => v + 1);
  }

  prevPage() {
    if (this.page() > 1) this.page.update(v => v - 1);
  }

  delete(id: number) {
    this.removingId.set(id);
    return this.api.delete(id).pipe(finalize(() => this.removingId.set(null)));
  }

  create(payload: JogadorUpsert) {
    return this.api.create(payload);
  }

  update(id: number, payload: JogadorUpsert) {
    return this.api.update(id, payload);
  }
}

