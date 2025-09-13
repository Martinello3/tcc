import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { Relatorio } from '../../models/relatorio';
import { RelatoriosService } from '../../services/relatorios.service';
import { JogadoresService } from '../../services/jogadores.service';
import type { Jogador } from '../../models/player';

@Component({
  standalone: true,
  selector: 'app-relatorio-list',
  imports: [CommonModule],
  template: `
  <div class="container">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h3 class="m-0"><i class="bi bi-file-earmark-text text-success"></i> Relatórios</h3>
        <small class="text-muted">Acompanhe os relatórios gerados por jogador</small>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table m-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Jogador</th>
                <th>Data de Geração</th>
                <th>Arquivo</th>
              </tr>
            </thead>
            <tbody>
              @if (relatorios().length === 0) {
                <tr><td colspan="3" class="text-center text-muted py-4">Nenhum relatório gerado ainda.</td></tr>
              } @else {
                @for (r of relatorios(); track r.id) {
                  <tr>
                    <td>{{ jogadorNome(r.jogadorId) }}</td>
                    <td>{{ r.dataGeracao ? (r.dataGeracao | date:'dd/MM/yyyy') : '-' }}</td>
                    <td>
                      @if (!!r.caminhoPdf) {
                        <a class="btn btn-sm btn-outline-primary" [href]="r.caminhoPdf!" target="_blank" rel="noopener">Visualizar</a>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `
})
export class RelatorioListComponent {
  private svc = inject(RelatoriosService);
  private jogadoresSvc = inject(JogadoresService);

  relatorios = signal<Relatorio[]>([]);
  jogadores = signal<Jogador[]>([]);

  constructor() {
    this.load();
  }

  private load() {
    this.svc.list().subscribe({ next: list => this.relatorios.set(list) });
    this.jogadoresSvc.list().subscribe({ next: list => this.jogadores.set(list) });
  }

  jogadorNome(id: number) {
    return this.jogadores().find(j => j.id === id)?.nome || `#${id}`;
  }
}

