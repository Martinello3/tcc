import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Clube, ClubeUpsert } from '../models/club';

@Injectable({ providedIn: 'root' })
export class ClubesService {
  private http = inject(HttpClient);
  private base = '/api/Clubes';

  list() {
    return this.http.get<Clube[]>(this.base);
  }

  get(id: number) {
    return this.http.get<Clube>(`${this.base}/${id}`);
    }

  create(payload: ClubeUpsert) {
    return this.http.post<Clube>(this.base, payload);
  }

  update(id: number, payload: ClubeUpsert) {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

