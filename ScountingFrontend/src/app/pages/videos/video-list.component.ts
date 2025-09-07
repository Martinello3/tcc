import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VideosFacade } from '../../facades/videos.facade';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import type { Video } from '../../models/video';
import { JogadoresService } from '../../services/jogadores.service';

@Component({
  selector: 'app-video-list',
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
    <h5 class="mb-0">Vídeos</h5>
    <small class="text-muted">Biblioteca de vídeos dos atletas</small>
  </div>
  <div class="d-flex gap-2">
    <div class="input-group search-group">
      <span class="input-group-text py-0"><i class="bi bi-search"></i></span>
      <input type="text" class="form-control search-input" placeholder="Buscar por marcação ou caminho" (input)="onFilter($any($event.target).value)" />
    </div>
    <a class="btn btn-success py-1" [routerLink]="['/videos','novo']"><i class="bi bi-plus-lg"></i> Novo</a>
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
        <caption class="text-center py-4 text-muted">Nenhum vídeo encontrado</caption>
      }
      <thead class="table-light">
        <tr>
          <th>Jogador</th>
          <th>Arquivo/URL</th>
          <th>Data</th>
          <th>Marcações</th>
          <th style="width: 140px"></th>
        </tr>
      </thead>
      <tbody>
        @for (v of displayed(); track v.id) {
          <tr>
            <td>{{ nomeJogador(v.jogadorId) }}</td>
            <td>{{ v.caminhoVideo || '-' }}</td>
            <td>{{ v.dataEnvio || '-' }}</td>
            <td>{{ v.marcacoes || '-' }}</td>
            <td class="text-end">
              <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/videos', v.id]">Editar</a>
              <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" (click)="onDelete(v)" [disabled]="facade.removingId() === v.id">
                @if (facade.removingId() === v.id) { <span class="spinner-border spinner-border-sm" role="status"></span> }
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
export class VideoListComponent implements OnInit {
  facade = inject(VideosFacade);
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

  async onDelete(v: Video) {
    const ok = await this.dialog.confirm(`Excluir vídeo de "${this.nomeJogador(v.jogadorId)}"?`, { title: 'Confirmação', variant: 'danger', confirmText: 'Excluir' });
    if (!ok) return;
    this.facade.delete(v.id).subscribe({ next: () => {
      this.toast.success('Vídeo excluído');
      this.facade.load();
    }, error: () => this.toast.error('Falha ao excluir vídeo') });
  }
}

