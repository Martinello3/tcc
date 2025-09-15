import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface ActivityItem {
  type: 'AVALIACAO_CONCLUIDA' | 'RELATORIO_GERADO' | 'VIDEO_ENVIADO' | string;
  entityName: string;
  url: string; // rota interna, ex: /jogadores/45
  timestamp: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  recent(count = 5): Observable<ActivityItem[]> {
    const uid = this.auth.user()?.id;
    const url = uid ? `/api/Activity/recent?count=${count}&userId=${uid}` : `/api/Activity/recent?count=${count}`;
    return this.http.get<ActivityItem[]>(url).pipe(
      map(list => list ?? [])
    );
  }
}

