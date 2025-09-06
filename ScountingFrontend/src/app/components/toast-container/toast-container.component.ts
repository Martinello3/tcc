import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 1080; }
  `],
  template: `
<div class="toast-container">
  @for (t of service.toasts(); track t.id) {
    <div class="alert alert-{{ mapType(t.type) }} shadow-sm d-flex align-items-start" role="alert">
      <div>
        <div class="fw-semibold">{{ t.title }}</div>
        <div>{{ t.message }}</div>
      </div>
      <button type="button" class="btn-close ms-3" aria-label="Close" (click)="service.dismiss(t.id)"></button>
    </div>
  }
</div>
  `
})
export class ToastContainerComponent {
  service = inject(ToastService);

  mapType(type: string) {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}

