import { Injectable, signal } from '@angular/core';

export type DialogType = 'confirm' | 'alert';

export type DialogVariant = 'default' | 'danger' | 'warning' | 'success' | 'info';

export interface DialogConfig {
  type: DialogType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  // Current dialog state
  readonly current = signal<DialogConfig | null>(null);

  private resolver: ((value?: any) => void) | null = null;

  confirm(message: string, opts?: Partial<DialogConfig>) {
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this.current.set({
        type: 'confirm',
        title: opts?.title ?? 'Confirmar',
        message,
        confirmText: opts?.confirmText ?? 'Confirmar',
        cancelText: opts?.cancelText ?? 'Cancelar',
      });
    });
  }

  alert(message: string, opts?: Partial<DialogConfig>) {
    return new Promise<void>((resolve) => {
      this.resolver = resolve as any;
      this.current.set({
        type: 'alert',
        title: opts?.title ?? 'Aviso',
        message,
        confirmText: opts?.confirmText ?? 'OK',
      });
    });
  }

  close(result?: boolean) {
    const r = this.resolver;
    this.resolver = null;
    this.current.set(null);
    if (r) r(result);
  }
}

