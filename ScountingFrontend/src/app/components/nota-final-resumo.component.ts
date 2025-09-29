import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocoInformativoComponent } from './bloco-informativo.component';

@Component({
  standalone: true,
  selector: 'app-nota-final-resumo',
  imports: [CommonModule, BlocoInformativoComponent],
  template: `
  <div class="mt-2">
    <app-bloco-informativo
      [title]="'Como a Nota Final é Calculada?'"
      [html]="finalHtml"
      storageKey="bloco-nota-final"
    ></app-bloco-informativo>
  </div>
  <div class="alert alert-light border mt-3 d-flex align-items-center justify-content-between">
    <div>
      <div class="small text-muted">Nota Final (atualiza automaticamente)</div>
      <div class="display-6 m-0">
        <ng-container *ngIf="notaFinal !== null; else parcial">{{ notaFinal | number:'1.0-2' }}</ng-container>
        <ng-template #parcial>N/A</ng-template>
      </div>
      <div class="text-muted small" *ngIf="notaFinal===null">Avaliação parcial — preencha pelo menos duas áreas para calcular a Nota Final</div>
    </div>
    <div class="text-end small">
      <div><strong>Física:</strong> {{ fisica | number:'1.0-2' }}</div>
      <div><strong>Técnica:</strong> {{ tecnica | number:'1.0-2' }}</div>
      <div><strong>Tática:</strong> {{ tatica | number:'1.0-2' }}</div>
    </div>
  </div>
  `
})
export class NotaFinalResumoComponent {
  @Input() notaFinal: number | null = null;
  @Input() fisica = 0;
  @Input() tecnica = 0;
  @Input() tatica = 0;

  // Conteúdos HTML com fórmulas para os blocos informativos
  finalHtml: string = `
    <p>A Nota Final do jogador combina o desempenho nas três áreas de avaliação: Física, Técnica e Tática. Cada área tem um peso diferente conforme a posição do jogador.

    Fórmula geral:
    NotaFinal = (Σ ÁreasPreenchidas (NotaÁrea × PesoÁrea)) ÷ (10 × Σ ÁreasPreenchidas (PesoÁrea)).

    <span class="text-secondary fw-semibold">Obs: a Nota Final é calculada quando pelo menos duas áreas possuem notas válidas. Áreas vazias são ignoradas (não contam como zero) e os pesos das áreas preenchidas são reponderados.</span></p>
  `;

}

