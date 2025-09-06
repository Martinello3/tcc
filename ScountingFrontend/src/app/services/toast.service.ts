import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  timeoutMs?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private _nextId = 1;

  toasts() {
    return this._toasts();
  }

  private push(toast: Omit<Toast, 'id'>) {
    const id = this._nextId++;
    const t: Toast = { id, ...toast };
    this._toasts.update(list => [t, ...list]);
    const timeout = t.timeoutMs ?? 4000;
    if (timeout > 0) {
      setTimeout(() => this.dismiss(id), timeout);
    }
  }

  dismiss(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  success(message: string, title = 'Sucesso', timeoutMs = 3000) {
    this.push({ type: 'success', message, title, timeoutMs });
  }

  error(message: string, title = 'Erro', timeoutMs = 5000) {
    this.push({ type: 'error', message, title, timeoutMs });
  }

  info(message: string, title = 'Info', timeoutMs = 3000) {
    this.push({ type: 'info', message, title, timeoutMs });
  }

  warning(message: string, title = 'Atenção', timeoutMs = 4000) {
    this.push({ type: 'warning', message, title, timeoutMs });
  }
}

