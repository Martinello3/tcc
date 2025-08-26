import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  token: string;
}

const TOKEN_KEY = 'scouting_token';
const USER_KEY = 'scouting_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user = signal<Omit<LoginResponse, 'token'> | null>(
    (() => {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as Omit<LoginResponse, 'token'>) : null;
    })()
  );

  readonly isLoggedIn = computed(() => !!this._token());

  isAuthenticated() {
    return this.isLoggedIn();
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, senha: password });
  }

  setSession(resp: LoginResponse) {
    const user = { id: resp.id, nome: resp.nome, email: resp.email, perfil: resp.perfil };
    this._token.set(resp.token);
    this._user.set(user);
    localStorage.setItem(TOKEN_KEY, resp.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  register(payload: { nome: string; email: string; senha: string; perfil: string; foto?: string | null }) {
    return this.http.post('/api/Usuarios', payload);
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  user() {
    return this._user();
  }
}

