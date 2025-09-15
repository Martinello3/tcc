import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LembretesService, Lembrete } from '../../services/lembretes.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-reminders-tasks-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
  .reminders-list { max-height: 320px; overflow-y: auto; margin-bottom: 1rem; }
  .reminder-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--bs-border-color-translucent);
    transition: all 0.2s ease;
  }
  .reminder-item:last-child { border-bottom: none; }
  .reminder-item:hover .delete-btn { opacity: 1; }
  .reminder-item.completed .reminder-text {
    text-decoration: line-through;
    opacity: 0.6;
    color: var(--bs-secondary);
  }
  .reminder-text {
    flex: 1;
    font-size: 0.9rem;
    line-height: 1.3;
    word-wrap: break-word;
  }
  .delete-btn {
    opacity: 0;
    transition: opacity 0.2s ease;
    border: none;
    background: none;
    color: var(--bs-danger);
    padding: 0.25rem;
    border-radius: 0.25rem;
  }
  .delete-btn:hover { background-color: var(--bs-danger-bg-subtle); }
  .add-section {
    border-top: 1px solid var(--bs-border-color-translucent);
    padding-top: 1rem;
    margin-top: 1rem;
  }
  .add-input-row { display: flex; gap: 0.5rem; align-items: center; }
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--bs-secondary);
  }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.7; }
  .muted { color: var(--text-muted); }
  `],
  template: `
  <div class="card h-100">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="m-0"><i class="bi bi-check2-square text-success"></i> Lembretes e Próximas Tarefas</h5>
      </div>

      @if (!userId) {
        <div class="text-center py-4 muted">
          <div style="font-size:2.5rem">🔒</div>
          <div>Entre para organizar seus lembretes.</div>
        </div>
      } @else {

        @if (loading) {
          <div class="muted">Carregando...</div>
        } @else if (!items.length) {
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <div class="fw-semibold">Tudo em dia!</div>
            <div>Adicione uma tarefa abaixo para começar a se organizar.</div>
          </div>
        } @else {
          <div class="reminders-list">
            <ul class="list-unstyled m-0">
              @for (l of items; track l.id) {
                <li class="reminder-item" [class.completed]="l.concluido">
                  <input type="checkbox" class="form-check-input mt-1" [checked]="l.concluido" (change)="toggle(l)" />
                  <div class="reminder-text">{{ l.texto }}</div>
                  <button class="delete-btn" title="Excluir" (click)="remove(l)"><i class="bi bi-trash"></i></button>
                </li>
              }
            </ul>
          </div>
        }

          <div class="add-section">
            <div class="add-input-row">
              <input [(ngModel)]="novoTexto" (keyup.enter)="add()" class="form-control form-control-sm" placeholder="Adicionar uma nova tarefa..." />
              <button class="btn btn-success btn-sm" (click)="add()" [disabled]="!novoTexto.trim() || busy">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

      }
    </div>
  </div>
  `
})
export class RemindersTasksWidgetComponent implements OnInit {
  private api = inject(LembretesService);
  private auth = inject(AuthService);

  userId: number | null = null;
  items: Lembrete[] = [];
  loading = false;
  busy = false;
  novoTexto = '';

  ngOnInit(): void {
    this.userId = this.auth.user()?.id ?? null;
    if (!this.userId) return;
    this.refresh();
  }

  refresh() {
    if (!this.userId) return;
    this.loading = true;
    this.api.list(this.userId).subscribe({ next: (list) => {
      const arr = (list || []).slice(0, 200);
      this.items = this.sortArray(arr).slice(0, 50);
      this.loading = false;
    }, error: () => { this.loading = false; } });
  }

  private tempId = -1;
  add() {
    const t = (this.novoTexto || '').trim();
    if (!t || !this.userId) return;
    const temp: Lembrete = { id: this.tempId--, usuarioId: this.userId, texto: t, concluido: false, createdAt: new Date().toISOString() } as Lembrete;
    this.items = [temp, ...this.items];
    this.items = this.sortArray(this.items);
    const idx = this.items.findIndex(x => x.id === temp.id);
    this.novoTexto = '';
    this.busy = true;
    this.api.create(t, this.userId).subscribe({ next: (created) => {
      this.busy = false;
      if (idx >= 0) this.items[idx] = created;
      this.items = this.sortArray(this.items);
    }, error: () => {
      this.busy = false;
      this.items = this.items.filter(x => x.id !== temp.id);
    } });
  }

  toggle(l: Lembrete) {
    if (!this.userId) return;
    const prev = l.concluido;
    l.concluido = !l.concluido;
    this.items = this.sortArray(this.items);
    this.api.update(l.id, { concluido: l.concluido }, this.userId).subscribe({
      error: () => { l.concluido = prev; this.items = this.sortArray(this.items); }
    });
  }

  remove(l: Lembrete) {
    if (!this.userId) return;
    const idx = this.items.findIndex(x => x.id === l.id);
    if (idx < 0) return;
    const removed = this.items.splice(idx, 1)[0];
    this.items = [...this.items];
    this.api.delete(l.id, this.userId).subscribe({ error: () => {
      this.items = [...this.items.slice(0, idx), removed, ...this.items.slice(idx)];
      this.items = this.sortArray(this.items);
    }});
  }

  private sortArray(arr: Lembrete[]): Lembrete[] {
    return [...arr].sort((a,b) => {
      if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
      const ta = new Date(a.createdAt as any).getTime();
      const tb = new Date(b.createdAt as any).getTime();
      return tb - ta; // recentes primeiro
    });
  }
}

