import { Component, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-bloco-informativo',
  imports: [CommonModule],
  styles: [`
    .info-block {
      background: #37373F; /* light gray per spec */
      color: #E5E7EB; /* light text for contrast */
      border-left: 4px solid #3B82F6; /* technological blue */
      border-radius: 8px;
      padding: 0; /* header/body manage padding */
    }
    .info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      cursor: pointer;
      user-select: none;
    }
    .info-title {
      margin: 0;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .info-icon {
      color: #9CA3AF; /* muted */
      transition: transform 0.2s ease;
      font-size: 1rem;
    }
    .info-content-wrapper {
      overflow: hidden;
      height: auto;
      transition: height 200ms ease;
    }
    .info-content {
      padding: 8px 12px 12px 12px;
      color: #D1D5DB;
      font-size: 0.9rem;
      white-space: pre-line;
    }
  `],
  template: `
  <div class="info-block">
    <div class="info-header" (click)="toggle()" [attr.aria-expanded]="expanded">
      <div class="info-title">{{ title }}</div>
      <i class="bi" [ngClass]="expanded ? 'bi-chevron-up' : 'bi-chevron-down'" class="info-icon"></i>
    </div>
    <div #contentRef class="info-content-wrapper">
      <div class="info-content">
        {{ content }}
      </div>
    </div>
  </div>
  `
})
export class BlocoInformativoComponent implements AfterViewInit {
  @Input() title: string = '';
  @Input() content: string = '';
  /** Optional key to persist state within the session */
  @Input() storageKey?: string;

  @ViewChild('contentRef') contentRef!: ElementRef<HTMLDivElement>;

  expanded = true; // default expanded

  ngAfterViewInit(): void {
    // restore state from sessionStorage if provided
    if (this.storageKey) {
      const saved = sessionStorage.getItem(this.sessionKey());
      if (saved === '0') this.expanded = false;
      if (saved === '1') this.expanded = true;
    }
    // initialize height accordingly
    const el = this.contentRef?.nativeElement;
    if (!el) return;
    if (this.expanded) {
      el.style.height = 'auto';
    } else {
      el.style.height = '0px';
    }
  }

  toggle() {
    this.expanded = !this.expanded;
    if (this.storageKey) sessionStorage.setItem(this.sessionKey(), this.expanded ? '1' : '0');
    this.animateHeight(this.expanded);
  }

  private animateHeight(expanding: boolean) {
    const el = this.contentRef?.nativeElement;
    if (!el) return;

    const from = expanding ? 0 : el.scrollHeight;
    const to = expanding ? el.scrollHeight : 0;

    // Set explicit start height
    el.style.height = from + 'px';
    // Force reflow to ensure the transition starts
    void el.getBoundingClientRect();
    // Transition to target height
    el.style.height = to + 'px';

    const onEnd = () => {
      el.removeEventListener('transitionend', onEnd);
      if (expanding) {
        // allow natural height after expansion
        el.style.height = 'auto';
      }
    };
    el.addEventListener('transitionend', onEnd);
  }

  private sessionKey(): string {
    return `bloco-informativo:${this.storageKey}`;
  }
}

