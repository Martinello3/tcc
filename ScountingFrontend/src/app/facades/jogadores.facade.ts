import { Injectable, computed, inject, signal } from '@angular/core';
import { JogadoresService } from '../services/jogadores.service';
import type { Jogador, JogadorUpsert } from '../models/player';
import { finalize } from 'rxjs/operators';

export type SortDir = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class JogadoresFacade {
  private api = inject(JogadoresService);

  // State
  readonly items = signal<Jogador[]>([]);
  readonly loading = signal(false);
  readonly removingId = signal<number | null>(null);

  readonly filter = signal('');
  readonly sortKey = signal<keyof Jogador>('nome');
  readonly sortDir = signal<SortDir>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly total = computed(() => this.items().length);

  readonly filtered = computed(() => {
    const q = this.filter().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(j => j.nome.toLowerCase().includes(q));
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

  setFilter(value: string) {
    this.filter.set(value);
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

