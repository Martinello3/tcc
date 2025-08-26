import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="margin:1rem 0;padding:0.75rem;border:1px solid #ddd;border-radius:8px;">
      <strong>Backend status:</strong>
      <span [style.color]="status() === 'ok' ? 'green' : 'red'">{{ status() || '...' }}</span>
      <button (click)="check()" style="margin-left:1rem">Check</button>
    </div>
  `,
})
export class HealthComponent {
  private api = inject(ApiService);
  status = signal<string | null>(null);

  check() {
    this.api.health().subscribe({
      next: (res) => this.status.set(res.status),
      error: () => this.status.set('error'),
    });
  }
}

