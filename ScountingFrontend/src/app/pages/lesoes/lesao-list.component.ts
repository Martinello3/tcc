import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LesoesFacade } from '../../facades/lesoes.facade';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import type { Lesao } from '../../models/lesao';
import { JogadoresService } from '../../services/jogadores.service';

@Component({
  selector: 'app-lesao-list',
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
    <h5 class="mb-0">Lesões</h5>
    <small class="text-muted">Histórico de lesões dos atletas</small>
  </div>
  <div class="d-flex gap-2">
    <div class="input-group search-group">
      <span class="input-group-text py-0"><i class="bi bi-search"></i></span>
      <input type="text" class="form-control search-input" placeholder="Buscar por descrição" (input)="onFilter($any($event.target).value)" />
    </div>
    <a class="btn btn-success py-1" [routerLink]="['/lesoes','novo']"><i class="bi bi-plus-lg"></i> Novo</a>
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
        <caption class="text-center py-4 text-muted">Nenhuma lesão encontrada</caption>
      }
      <thead class="table-light">
        <tr>
          <th>Jogador</th>
          <th>Tipo</th>
          <th>Local</th>
          <th>Ocorrência</th>
          <th>Recuperação</th>
          <th>Descrição</th>
          <th style="width: 140px"></th>
        </tr>
      </thead>
      <tbody>
        @for (l of displayed(); track l.id) {
          <tr>
            <td>{{ nomeJogador(l.jogadorId) }}</td>
            <td><span class="badge rounded-pill text-bg-secondary">{{ mapTipo(l.tipoLesao) }}</span></td>
            <td><span class="badge rounded-pill text-bg-info">{{ mapLocal(l.localCorpo) }}</span></td>
            <td>{{ l.dataOcorrencia }}</td>
            <td>{{ l.dataRecuperacao || '-' }}</td>
            <td>{{ l.descricao }}</td>
            <td class="text-end">
              <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/lesoes', l.id]">Editar</a>
              <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" (click)="onDelete(l)" [disabled]="facade.removingId() === l.id">
                @if (facade.removingId() === l.id) { <span class="spinner-border spinner-border-sm" role="status"></span> }
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
export class LesaoListComponent implements OnInit {
  facade = inject(LesoesFacade);
  private router = inject(Router);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);
  private jogadoresSvc = inject(JogadoresService);

  jogadores: { id: number; nome: string }[] = [];
  displayed = this.facade.sorted;

  ngOnInit() {
    this.facade.load();
    this.jogadoresSvc.list().subscribe({ next: (res) => this.jogadores = res.map(j => ({ id: j.id, nome: j.nome })) });
  }

  onFilter(value: string) { this.facade.setFilter(value); }

  nomeJogador(id: number) {
    return this.jogadores.find(j => j.id === id)?.nome ?? '-';
  }

  mapTipo(t?: string | null) {
    const map: any = { M: 'Muscular', L: 'Ligamentar', O: 'Óssea', C: 'Contusão', N: 'Neurológica' };
    return t ? (map[t] ?? t) : '-';
  }

  mapLocal(l?: string | null) {
    const map: any = { JL: 'Joelho', TB: 'Tíbia', CM: 'Coxa/Posterior', OM: 'Ombro', CT: 'Costas', OT: 'Outro' };
    return l ? (map[l] ?? l) : '-';
  }

  async onDelete(l: Lesao) {
    const ok = await this.dialog.confirm(`Excluir lesão de "${this.nomeJogador(l.jogadorId)}"?`, { title: 'Confirmação', variant: 'danger', confirmText: 'Excluir' });
    if (!ok) return;
    this.facade.delete(l.id).subscribe({ next: () => {
      this.toast.success('Lesão excluída');
      this.facade.load();
    }, error: () => this.toast.error('Falha ao excluir lesão') });
  }
}

