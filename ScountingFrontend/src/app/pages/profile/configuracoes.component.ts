import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .title { text-align: center; margin-bottom: 1rem; }
    .section-title { font-weight: 600; margin-bottom: .5rem; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .theme-card {
      position: relative;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-elev);
      color: var(--text);
      padding: 1rem;
      cursor: pointer;
      transition: border-color .2s ease, background-color .2s ease, transform .1s ease;
      user-select: none;
      min-height: 96px;
      display: flex; align-items: center; gap: .75rem;
    }
    .theme-card:hover { transform: translateY(-1px); }
    .theme-card.active { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(16,185,129,.15); }
    .theme-card .icon { font-size: 1.5rem; }
    .check {
      position: absolute; top: .5rem; right: .5rem; width: 28px; height: 28px;
      border-radius: 999px; background: var(--primary); color: white;
      display: flex; align-items: center; justify-content: center;
    }
    .muted { color: var(--text-muted); }
  `],
  template: `
    <h2 class="title">Configurações</h2>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="section">
          <div class="section-title">Aparência</div>
          <div class="muted small mb-3">Escolha entre tema escuro e claro. Sua preferência será salva neste dispositivo.</div>

          <div class="grid">
            <div class="theme-card" [class.active]="currentTheme() === 'dark'" (click)="set('dark')" aria-label="Tema Escuro">
              <i class="bi bi-moon icon"></i>
              <div>
                <div class="fw-semibold">Tema Escuro</div>
                <div class="muted small">Melhor para ambientes com pouca luz</div>
              </div>
              <div class="check" *ngIf="currentTheme() === 'dark'"><i class="bi bi-check"></i></div>
            </div>

            <div class="theme-card" [class.active]="currentTheme() === 'light'" (click)="set('light')" aria-label="Tema Claro">
              <i class="bi bi-sun icon"></i>
              <div>
                <div class="fw-semibold">Tema Claro</div>
                <div class="muted small">Ideal para ambientes bem iluminados</div>
              </div>
              <div class="check" *ngIf="currentTheme() === 'light'"><i class="bi bi-check"></i></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfiguracoesComponent {
  private theme = inject(ThemeService);
  currentTheme = computed(() => this.theme.theme());
  set(mode: 'dark' | 'light') { this.theme.setTheme(mode); }
}

