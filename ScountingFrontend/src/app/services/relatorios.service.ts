import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Relatorio } from '../models/relatorio';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private http = inject(HttpClient);
  private base = '/api/Relatorios';

  list() { return this.http.get<Relatorio[]>(this.base); }

  get(id: number) { return this.http.get<Relatorio>(`${this.base}/${id}`); }

  generate(avaliacaoId: number) {
    return this.http.post<Relatorio>(`${this.base}/gerar/${avaliacaoId}`, {});
  }
}

