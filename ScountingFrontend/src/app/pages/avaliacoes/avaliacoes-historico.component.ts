import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvaliacoesService } from '../../services/avaliacoes.service';
import { JogadoresService } from '../../services/jogadores.service';
import { RelatoriosService } from '../../services/relatorios.service';
import type { Avaliacao } from '../../models/avaliacao';
import type { Jogador } from '../../models/player';

@Component({
  standalone: true,
  selector: 'app-avaliacoes-historico',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="container">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h3 class="m-0"><i class="bi bi-clipboard2-check text-success"></i> Histórico de Avaliações — {{ jogador()?.nome || '-' }}</h3>
      <div class="page-header-actions d-flex align-items-center gap-2">
        <a class="btn btn-outline-secondary" [routerLink]="['/jogadores', jogadorId, 'perfil']">Voltar</a>
        <a class="btn btn-success d-inline-flex align-items-center gap-2" [routerLink]="['/avaliacoes', jogadorId, 'novo']"><i class="bi bi-plus-lg"></i> <span>Novo</span></a>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table m-0 align-middle">
            <thead>
              <tr>
                <th>Data</th>
                <th class="text-center">Nota Final</th>
                <th>Comentarios</th>
                <th style="width: 160px"></th>
              </tr>
            </thead>
            <tbody>
              @if (avaliacoes().length === 0) {
                <tr><td colspan="3" class="text-center text-muted py-4">Nenhuma avaliacao registrada.</td></tr>
              } @else {
                @for (a of avaliacoes(); track a.id) {
                  <tr>
                    <td>{{ a.data ? (a.data | date:'dd/MM/yyyy') : '-' }}</td>
                    <td class="text-center fw-semibold">{{ a.notaFinal ?? '-' }}</td>
                    <td>{{ a.comentarios || '-' }}</td>
                    <td class="text-end">
                      <a class="btn btn-sm btn-outline-primary" [routerLink]="['/relatorios/avaliacao', jogadorId, a.id]"><i class="bi bi-file-earmark-text"></i> Relatório</a>
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
export class AvaliacoesHistoricoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(AvaliacoesService);
  private jogadoresSvc = inject(JogadoresService);
  private relatoriosSvc = inject(RelatoriosService);

  jogadorId = Number(this.route.snapshot.paramMap.get('jogadorId'));
  avaliacoes = signal<Avaliacao[]>([]);
  jogador = signal<Jogador | null>(null);

  constructor() {
    if (!this.jogadorId) {
      this.router.navigate(['/avaliacoes']);
      return;
    }
    this.jogadoresSvc.get(this.jogadorId).subscribe({ next: j => this.jogador.set(j) });
    this.load();
  }

  gerarRelatorio(avaliacaoId: number) {
    this.relatoriosSvc.generate(avaliacaoId).subscribe({
      next: (r) => {
        if (r?.caminhoPdf) {
          window.open(r.caminhoPdf, '_blank');
        }
      }
    });
  }


  private load() {
    this.svc.byJogador(this.jogadorId).subscribe({ next: list => this.avaliacoes.set(list) });
  }
}

