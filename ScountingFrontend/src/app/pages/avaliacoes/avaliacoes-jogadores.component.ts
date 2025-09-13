import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JogadoresService } from '../../services/jogadores.service';
import type { Jogador } from '../../models/player';

@Component({
  standalone: true,
  selector: 'app-avaliacoes-jogadores',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="container">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h3 class="m-0"><i class="bi bi-clipboard2-check text-success"></i> Avaliações • Jogadores</h3>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle m-0">
            <thead class="table-light">
              <tr>
                <th>Jogador</th>
                <th>Posição</th>
                <th>Clube</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (j of jogadores; track j.id) {
                <tr>
                  <td class="fw-medium">{{ j.nome }}</td>
                  <td>{{ j.posicao || '-' }}</td>
                  <td>{{ j.clubeAtual?.nome || '-' }}</td>
                  <td class="text-end">
                    <a class="btn btn-sm btn-outline-success me-2" [routerLink]="['/avaliacoes', j.id, 'novo']">
                      <i class="bi bi-plus-lg"></i> Avaliar
                    </a>
                    <a class="btn btn-sm btn-outline-secondary" [routerLink]="['/avaliacoes', j.id]">
                      <i class="bi bi-eye"></i> Visualizar
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AvaliacoesJogadoresComponent {
  private jogadoresSvc = inject(JogadoresService);
  private router = inject(Router);

  jogadores: Jogador[] = [];

  constructor() {
    this.jogadoresSvc.list().subscribe({ next: data => (this.jogadores = data) });
  }
}

