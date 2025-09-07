import { Injectable, computed, inject, signal } from '@angular/core';
import type { Lesao, LesaoUpsert } from '../models/lesao';
import { LesoesService } from '../services/lesoes.service';
import { finalize } from 'rxjs/operators';

export type SortDir = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class LesoesFacade {
  private api = inject(LesoesService);

  readonly items = signal<Lesao[]>([]);
  readonly loading = signal(false);
  readonly removingId = signal<number | null>(null);

  readonly filter = signal('');
  readonly sortKey = signal<keyof Lesao>('dataOcorrencia');
  readonly sortDir = signal<SortDir>('desc');

  readonly total = computed(() => this.items().length);

  readonly filtered = computed(() => {
    const q = this.filter().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(l => (l.descricao ?? '').toLowerCase().includes(q));
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

  load() {
    this.loading.set(true);
    this.api.list().subscribe({ next: (res) => this.items.set(res), complete: () => this.loading.set(false) });
  }

  setFilter(value: string) { this.filter.set(value); }

  delete(id: number) {
    this.removingId.set(id);
    return this.api.delete(id).pipe(finalize(() => this.removingId.set(null)));
  }

  create(payload: LesaoUpsert) { return this.api.create(payload); }
  update(id: number, payload: LesaoUpsert) { return this.api.update(id, payload); }
}

