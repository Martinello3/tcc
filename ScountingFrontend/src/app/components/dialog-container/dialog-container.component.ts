import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .dialog-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1085;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .dialog-card { width: 100%; max-width: 460px; }
  `],
  template: `
  @if (vm()) {
    <div class="dialog-backdrop">
      <div class="card shadow dialog-card" [ngClass]="mapCardClass(vm()!.variant)">
        <div class="card-header bg-white border-0 d-flex align-items-center">
          @if (vm()!.variant === 'danger') { <i class="bi bi-exclamation-triangle text-danger me-2"></i> }
          @if (vm()!.variant === 'warning') { <i class="bi bi-exclamation-circle text-warning me-2"></i> }
          @if (vm()!.variant === 'success') { <i class="bi bi-check-circle text-success me-2"></i> }
          @if (vm()!.variant === 'info' || !vm()!.variant) { <i class="bi bi-info-circle text-primary me-2"></i> }
          <strong>{{ vm()!.title }}</strong>
        </div>
        <div class="card-body">
          <p class="mb-0">{{ vm()!.message }}</p>
        </div>
        <div class="card-footer bg-white border-0 d-flex justify-content-end gap-2">
          @if (vm()!.type === 'confirm') { <button class="btn btn-outline-secondary" (click)="dialog.close(false)">{{ vm()!.cancelText }}</button> }
          <button class="btn" [ngClass]="vm()!.type === 'confirm' ? 'btn-primary' : 'btn-success'" (click)="dialog.close(true)">{{ vm()!.confirmText }}</button>
        </div>
      </div>
    </div>
  }
  `
})
export class DialogContainerComponent {
  dialog = inject(DialogService);
  vm = computed(() => this.dialog.current());

  mapCardClass(variant: string | undefined) {
    switch (variant) {
      case 'danger': return 'border-danger';
      case 'warning': return 'border-warning';
      case 'success': return 'border-success';
      default: return '';
    }
  }
}

