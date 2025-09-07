import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Video, VideoUpsert } from '../models/video';

@Injectable({ providedIn: 'root' })
export class VideosService {
  private http = inject(HttpClient);
  private base = '/api/Videos';

  list() { return this.http.get<Video[]>(this.base); }
  byJogador(jogadorId: number) { return this.http.get<Video[]>(`${this.base}/por-jogador/${jogadorId}`); }
  get(id: number) { return this.http.get<Video>(`${this.base}/${id}`); }
  create(payload: VideoUpsert) { return this.http.post<Video>(this.base, payload); }
  update(id: number, payload: VideoUpsert) { return this.http.put<void>(`${this.base}/${id}`, payload); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}

