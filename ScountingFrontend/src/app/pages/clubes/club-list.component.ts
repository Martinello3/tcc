import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { Clube } from '../../models/club';
import { ClubesFacade } from '../../facades/clubes.facade';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-club-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .page-header { position: sticky; top: 0; z-index: 1; background: #fff; }
    .overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; z-index: 1; }
    .search-group { width: 360px; }
    .search-input { height: 34px; padding-top: .25rem; padding-bottom: .25rem; }
  `],
  template: `
<div class="page-header d-flex align-items-center justify-content-between mb-3">
  <div>
    <h5 class="mb-0">Clubes</h5>
    <small class="text-muted">Gerencie os clubes cadastrados</small>
  </div>
  <div class="d-flex gap-2">
    <div class="input-group search-group">
      <span class="input-group-text py-0"><i class="bi bi-search"></i></span>
      <input type="text" class="form-control search-input" placeholder="Buscar por nome" (input)="onFilter($any($event.target).value)" />
    </div>
    <a class="btn btn-success py-1" [routerLink]="['/clubes','novo']"><i class="bi bi-plus-lg"></i> Novo</a>
  </div>
</div>

<div class="card shadow-sm position-relative">
  @if (facade.loading()) {
    <div class="overlay">
      <div class="spinner-border text-success" role="status"></div>
    </div>
  }
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle mb-0">
      @if (!facade.loading() && clubes().length === 0) {
        <caption class="text-center py-4 text-muted">Nenhum clube encontrado</caption>
      }
      <thead class="table-light">
        <tr>
          <th>Nome</th>
          <th>Cidade</th>
          <th>Estado</th>
          <th>País</th>
          <th style="width: 140px"></th>
        </tr>
      </thead>
      <tbody>
        @for (c of clubes(); track c.id) {
          <tr>
            <td>{{ c.nome }}</td>
            <td>{{ c.cidade || '-' }}</td>
            <td>{{ c.estado || '-' }}</td>
            <td>{{ c.pais || '-' }}</td>
            <td class="text-end">
              <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/clubes', c.id]">Editar</a>
              <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" (click)="onDelete(c)" [disabled]="facade.removingId() === c.id">
                @if (facade.removingId() === c.id) { <span class="spinner-border spinner-border-sm" role="status"></span> }
                Excluir
              </button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</div>
  `
})
export class ClubListComponent implements OnInit {
  facade = inject(ClubesFacade);
  private router = inject(Router);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  clubes = this.facade.items;
  query = this.facade.filter;
  displayed = this.facade.displayed;

  ngOnInit() {
    this.facade.load();
  }

  onFilter(value: string) {
    this.facade.setFilter(value);
  }

  async onDelete(c: Clube) {
    const ok = await this.dialog.confirm(`Excluir clube "${c.nome}"?`, { title: 'Confirmação', variant: 'danger', confirmText: 'Excluir' });
    if (!ok) return;
    this.facade.delete(c.id).subscribe({ next: () => {
      this.toast.success('Clube excluído');
      this.facade.load();
    }, error: () => this.toast.error('Falha ao excluir clube') });
  }
}

