import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Avaliacao, AvaliacaoCreate } from '../models/avaliacao';

@Injectable({ providedIn: 'root' })
export class AvaliacoesService {
  private http = inject(HttpClient);
  private base = '/api/Avaliacoes';

  byJogador(jogadorId: number) {
    return this.http.get<Avaliacao[]>(`${this.base}/by-jogador/${jogadorId}`);
  }

  detalhes(avaliacaoId: number) {
    return this.http.get<any>(`${this.base}/${avaliacaoId}/detalhes`);
  }

  create(payload: AvaliacaoCreate) {
    return this.http.post<Avaliacao>(this.base, payload);
  }

  // Novo endpoint para o schema novo: POST /api/jogadores/{id}/avaliacoes
  createForJogador(jogadorId: number, dados_avaliacao: any) {
    return this.http.post<any>(`/api/jogadores/${jogadorId}/avaliacoes`, dados_avaliacao);
  }
}
