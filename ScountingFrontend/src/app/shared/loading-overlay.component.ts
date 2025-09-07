import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  template: `
    @if (show) {
      <div class="loading-overlay">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() show = false;
}

