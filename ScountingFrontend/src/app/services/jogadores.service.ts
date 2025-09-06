import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Jogador, JogadorUpsert } from '../models/player';

@Injectable({ providedIn: 'root' })
export class JogadoresService {
  private http = inject(HttpClient);
  private base = '/api/Jogadores';

  list() {
    return this.http.get<Jogador[]>(this.base);
  }

  get(id: number) {
    return this.http.get<Jogador>(`${this.base}/${id}`);
  }

  create(payload: JogadorUpsert) {
    return this.http.post<Jogador>(this.base, payload);
  }

  update(id: number, payload: JogadorUpsert) {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

