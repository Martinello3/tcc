import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Em dev, usamos proxy.conf.json para encaminhar /api -> http://localhost:5180
  health() {
    return this.http.get<{ status: string }>(`/api/health`);
  }
}

