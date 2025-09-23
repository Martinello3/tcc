import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme-preference';
  theme = signal<AppTheme>('dark');

  constructor() {
    // Initialize from localStorage or system preference
    const saved = (localStorage.getItem(this.storageKey) as AppTheme | null);
    if (saved === 'light' || saved === 'dark') {
      this.apply(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(prefersDark ? 'dark' : 'light');
    }

    // React to OS changes (optional best-effort)
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', (e) => {
        // Only auto-switch if user hasn't explicitly chosen
        const cur = localStorage.getItem(this.storageKey);
        if (!cur) this.apply(e.matches ? 'dark' : 'light');
      });
    }
  }

  setTheme(next: AppTheme) { this.apply(next, true); }
  toggle() { this.setTheme(this.theme() === 'dark' ? 'light' : 'dark'); }

  private apply(next: AppTheme, persist: boolean = false) {
    this.theme.set(next);
    const root = document.documentElement;
    if (next === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
    if (persist) {
      localStorage.setItem(this.storageKey, next);
    }
  }
}

