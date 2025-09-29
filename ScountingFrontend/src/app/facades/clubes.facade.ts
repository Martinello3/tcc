import { Injectable, computed, inject, signal } from '@angular/core';
import { ClubesService } from '../services/clubes.service';
import type { Clube, ClubeUpsert } from '../models/club';
import { finalize } from 'rxjs/operators';

export type SortDir = 'asc' | 'desc';

export interface ClubesFilterState {
  nome: string;
  cidade: string;
  estado: string;
  pais: string;
}

@Injectable({ providedIn: 'root' })
export class ClubesFacade {
  private api = inject(ClubesService);

  // State
  readonly items = signal<Clube[]>([]);
  readonly loading = signal(false);
  readonly removingId = signal<number | null>(null);

  readonly filters = signal<ClubesFilterState>({ nome: '', cidade: '', estado: '', pais: '' });
  readonly sortKey = signal<keyof Clube>('nome');
  readonly sortDir = signal<SortDir>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly total = computed(() => this.items().length);

  readonly filtered = computed(() => {
    const f = this.filters();
    const nome = f.nome.toLowerCase().trim();
    const cidade = f.cidade.toLowerCase().trim();
    const estado = f.estado.toLowerCase().trim();
    const pais = f.pais.toLowerCase().trim();
    return this.items().filter(c => {
      if (nome && !c.nome.toLowerCase().includes(nome)) return false;
      if (cidade && !(c.cidade || '').toLowerCase().includes(cidade)) return false;
      if (estado) {
        const ce = (c.estado || '').toLowerCase().trim();
        if (estado.length === 2 ? ce !== estado : !ce.includes(estado)) return false;
      }
      if (pais && !(c.pais || '').toLowerCase().includes(pais)) return false;
      return true;
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
    this.api.list().subscribe({
      next: (res) => this.items.set(res),
      error: () => {},
      complete: () => this.loading.set(false)
    });
  }

  // Backward compatibility: nome quick filter
  setFilter(value: string) {
    this.filters.update(f => ({ ...f, nome: value }));
    this.page.set(1);
  }

  setFilters(partial: Partial<ClubesFilterState>) {
    this.filters.update(f => ({ ...f, ...partial }));
    this.page.set(1);
  }

  clearFilters() {
    this.filters.set({ nome: '', cidade: '', estado: '', pais: '' });
    this.page.set(1);
  }

  sortBy(key: keyof Clube) {
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

  create(payload: ClubeUpsert) {
    return this.api.create(payload);
  }

  update(id: number, payload: ClubeUpsert) {
    return this.api.update(id, payload);
  }
}

