import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Lembrete {
  id: number;
  usuarioId: number;
  texto: string;
  concluido: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LembretesService {
  private http = inject(HttpClient);
  private base = '/api/Lembretes';

  list(userId: number) {
    return this.http.get<Lembrete[]>(`${this.base}`, { params: { userId } as any });
  }

  create(texto: string, userId: number) {
    return this.http.post<Lembrete>(`${this.base}`, { texto }, { params: { userId } as any });
  }

  update(id: number, patch: Partial<Pick<Lembrete, 'texto'|'concluido'>>, userId: number) {
    return this.http.put<void>(`${this.base}/${id}`, patch, { params: { userId } as any });
  }

  delete(id: number, userId: number) {
    return this.http.delete<void>(`${this.base}/${id}`, { params: { userId } as any });
  }
}

