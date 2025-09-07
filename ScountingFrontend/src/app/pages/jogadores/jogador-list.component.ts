import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import type { Jogador } from '../../models/player';
import { JogadoresFacade } from '../../facades/jogadores.facade';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { ClubesService } from '../../services/clubes.service';

@Component({
  selector: 'app-jogador-list',
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
    <h5 class="mb-0">Jogadores</h5>
    <small class="text-muted">Gerencie os jogadores cadastrados</small>
  </div>
  <div class="d-flex gap-2">
    <div class="input-group search-group">
      <span class="input-group-text py-0"><i class="bi bi-search"></i></span>
      <input type="text" class="form-control search-input" placeholder="Buscar por nome" (input)="onFilter($any($event.target).value)" />
    </div>
    <a class="btn btn-success py-1" [routerLink]="['/jogadores','novo']"><i class="bi bi-plus-lg"></i> Novo</a>
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
        @if (!facade.loading() && displayed().length === 0) {
          <caption class="text-center py-4 text-muted">Nenhum jogador encontrado</caption>
        }
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th>Posição</th>
            <th>Nacionalidade</th>
            <th>Clube Atual</th>
            <th>Data Nasc.</th>

            <th style="width: 160px" class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (j of displayed(); track j.id) {
            <tr>
              <td class="fw-semibold">{{ j.nome }}</td>
              <td><span class="badge text-bg-light">{{ j.posicao || '-' }}</span></td>
              <td>{{ j.nacionalidade || '-' }}</td>
              <td>{{ j.clubeAtual?.nome || clubesById.get(j.clubeAtualId || -1) || '-' }}</td>
              <td>{{ j.dataNascimento | date:'dd/MM/yyyy' }}</td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/jogadores', j.id]">Editar</a>
                <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" (click)="onDelete(j)" [disabled]="facade.removingId() === j.id">
                  @if (facade.removingId() === j.id) { <span class="spinner-border spinner-border-sm" role="status"></span> }
                  Excluir
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `
})
export class JogadorListComponent implements OnInit {
  facade = inject(JogadoresFacade);
  private router = inject(Router);
  private toast = inject(ToastService);
  private clubesSvc = inject(ClubesService);
  clubesById = new Map<number, string>();

  private dialog = inject(DialogService);

  jogadores = this.facade.items;
  query = this.facade.filter;
  displayed = this.facade.displayed;

  ngOnInit() {
    this.facade.load();
    // Carrega clubes para garantir nome mesmo que o jogador venha sem navegação
    this.clubesSvc.list().subscribe({ next: (res) => {
      res.forEach(c => this.clubesById.set(c.id, c.nome));
    }});
  }

  onFilter(value: string) {
    this.facade.setFilter(value);
  }

  async onDelete(j: Jogador) {
    const ok = await this.dialog.confirm(`Excluir jogador "${j.nome}"?`, { title: 'Confirmação', variant: 'danger', confirmText: 'Excluir' });
    if (!ok) return;
    this.facade.delete(j.id).subscribe({ next: () => {
      this.toast.success('Jogador excluído');
      this.facade.load();
    }, error: () => this.toast.error('Falha ao excluir jogador') });
  }
}

