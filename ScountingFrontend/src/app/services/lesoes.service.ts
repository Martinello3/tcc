import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Lesao, LesaoUpsert } from '../models/lesao';

@Injectable({ providedIn: 'root' })
export class LesoesService {
  private http = inject(HttpClient);
  private base = '/api/Lesoes';

  list() { return this.http.get<Lesao[]>(this.base); }
  byJogador(jogadorId: number) { return this.http.get<Lesao[]>(`${this.base}/por-jogador/${jogadorId}`); }
  get(id: number) { return this.http.get<Lesao>(`${this.base}/${id}`); }
  create(payload: LesaoUpsert) { return this.http.post<Lesao>(this.base, payload); }
  update(id: number, payload: LesaoUpsert) { return this.http.put<void>(`${this.base}/${id}`, payload); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}

