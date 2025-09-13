import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RelatorioData {
  jogador: {
    nome: string;
    foto_url?: string;
    data_nascimento: string;
    posicao: string;
    nacionalidade: string;
    bandeira_url?: string;
    altura_m: number;
    peso_kg: number;
    pe_dominante: string;
  };
  clube?: {
    nome: string;
    logo_url?: string;
  };
  avaliacao: {
    data_avaliacao: string;
    local_avaliacao: string;
    comentarios_gerais: string;
    avaliador: {
      nome: string;
    };
    fisica: Array<{
      teste: string;
      resultado: string;
      unidade: string;
    }>;
    tecnica: Array<{
      exercicio: string;
      acertos: number;
      tentativas: number;
      observacoes?: string;
    }>;
    tatica_comportamental: {
      posicionamento?: number | null;
      leitura_jogo?: number | null;
      tomada_decisao?: number | null;
      disciplina_tatica?: number | null;
      competitividade?: number | null;
      inteligencia_emocional?: number | null;
    };
  };
  meta: {
    data_geracao: string;
  };
}

@Component({
  selector: 'app-relatorio-avaliacao',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    /* Tema claro para relatório - otimizado para impressão */
    .relatorio-container {
      background: #FFFFFF;
      color: #1F2937;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
      width: 210mm; /* A4 width */
      height: 297mm; /* A4 height */
      margin: 0 auto;
      padding: 15mm;
      box-sizing: border-box;
      font-size: 12px;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Cabeçalho */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 24px;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 700;
      color: #10B981;
    }
    .header-info {
      text-align: right;
    }
    .header-title {
      font-size: 14px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-date {
      font-size: 11px;
      color: #6B7280;
      margin-top: 4px;
    }

    /* Identificação do Atleta */
    .athlete-id {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .athlete-photo {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      object-fit: cover;
      background: #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B7280;
      font-size: 32px;
    }
    .athlete-info h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1F2937;
    }
    .position-tag {
      background: #10B981;
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 8px;
    }
    .club-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6B7280;
    }
    .club-logo {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      object-fit: cover;
    }

    /* Layout de duas colunas */
    .main-content {
      display: flex;
      gap: 24px;
    }
    .left-column {
      flex: 0 0 35%;
    }
    .right-column {
      flex: 1;
    }

    /* Seções */
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #10B981;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      border-bottom: 2px solid #10B981;
      padding-bottom: 4px;
    }

    /* Informações gerais */
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .info-label {
      font-weight: 600;
      color: #6B7280;
    }
    .info-value {
      color: #1F2937;
      font-weight: 500;
    }

    /* Tabelas */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .data-table th {
      background: #F9FAFB;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      color: #6B7280;
      border-bottom: 2px solid #E5E7EB;
      font-size: 11px;
    }
    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #F3F4F6;
      font-size: 11px;
    }

    /* Perfil Tático em barras */
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 16px;
    }
    .skill {}
    .skill-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 6px;
    }
    .progress {
      width: 100%;
      height: 8px;
      background: #E5E7EB;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: #10B981;
      width: 0%;
      border-radius: inherit;
    }

    /* Comentários (Análise do Avaliador) */
    .comments-block {
      background: #F9FAFB;
      border-left: 4px solid #10B981;
      padding: 16px;
      margin: 12px 0;
    }
    .comments-text {
      margin-left: 0;
      line-height: 1.6;
    }

    /* Rodapé */
    .footer {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid #E5E7EB;
      font-size: 10px;
      color: #6B7280;
      margin-top: auto;
    }

    /* Utilitários */
    .flag-icon {
      width: 20px;
      height: 14px;
      border-radius: 2px;
      margin-right: 6px;
    }
    .precision-badge {
      background: #10B981;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    @media print {
      .relatorio-container {
        margin: 0;
        box-shadow: none;
      }
      .footer { position: static; }
    }
  `],
  template: `
    <div class="relatorio-container">
      <!-- Cabeçalho -->
      <div class="header">
        <div class="header-logo">Seu Olheiro</div>
        <div class="header-info">
          <div class="header-title">Relatório de Avaliação Individual</div>
          <div class="header-date">Gerado em: {{ formatDate(data.meta.data_geracao) }}</div>
        </div>
      </div>

      <!-- Identificação do Atleta -->
      <div class="athlete-id">
        <div class="athlete-photo">
          @if (data.jogador.foto_url) {
            <img [src]="data.jogador.foto_url" alt="Foto do jogador" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
          } @else {
            <i class="bi bi-person"></i>
          }
        </div>
        <div class="athlete-info">
          <h1>{{ data.jogador.nome }}</h1>
          <div class="position-tag">{{ data.jogador.posicao }}</div>
          @if (data.clube) {
            <div class="club-info">
              @if (data.clube.logo_url) {
                <img [src]="data.clube.logo_url" alt="Logo do clube" class="club-logo">
              }
              <span>{{ data.clube.nome }}</span>
            </div>


          }
        </div>
      </div>

      <!-- Observações do Avaliador -->
      <div class="section">
        <div class="section-title">Observações Gerais do Avaliador</div>
        <div class="comments-block">
          <div class="comments-text">{{ data.avaliacao.comentarios_gerais || 'Sem observações registradas.' }}</div>
        </div>
      </div>

      <!-- Layout de duas colunas -->
      <div class="main-content">
        <!-- Coluna Esquerda -->
        <div class="left-column">
          <!-- Informações Gerais -->
          <div class="section">
            <div class="section-title">Informações Gerais</div>
            <div class="info-item">


              <span class="info-label">Nacionalidade:</span>
              <span class="info-value">
                @if (data.jogador.bandeira_url) {
                  <img [src]="data.jogador.bandeira_url" alt="Bandeira" class="flag-icon">
                }
                {{ data.jogador.nacionalidade }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Nascimento:</span>
              <span class="info-value">{{ formatBirthDate(data.jogador.data_nascimento) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Altura:</span>
              <span class="info-value">{{ data.jogador.altura_m }} m</span>
            </div>
            <div class="info-item">
              <span class="info-label">Peso:</span>
              <span class="info-value">{{ data.jogador.peso_kg }} kg</span>
            </div>
            <div class="info-item">
              <span class="info-label">Pé Dominante:</span>
              <span class="info-value">{{ data.jogador.pe_dominante }}</span>
            </div>

          </div>

          <!-- Avaliação Realizada -->
          <div class="section">
            <div class="section-title">Avaliação Realizada</div>
            <div class="info-item">
              <span class="info-label">Data:</span>
              <span class="info-value">{{ formatDate(data.avaliacao.data_avaliacao) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Local:</span>
              <span class="info-value">{{ data.avaliacao.local_avaliacao }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Avaliador:</span>
              <span class="info-value">{{ data.avaliacao.avaliador.nome }}</span>
            </div>
          </div>
        </div>

        <!-- Coluna Direita -->
        <div class="right-column">
          <!-- Análise Tática & Comportamental -->
          <div class="section">
            <div class="section-title">Perfil Tático e Comportamental</div>
            @if (skills().length > 0) {
              <div class="skills-grid">
                @for (s of skills(); track s.label) {
                  <div class="skill">
                    <div class="skill-header">
                      <span>{{ s.label }}</span>
                      <span>{{ s.value }}/10</span>
                    </div>
                    <div class="progress"><div class="progress-bar" [style.width.%]="s.value * 10"></div></div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-muted small fst-italic">Sem avaliação tática/comportamental registrada.</div>
            }
          </div>

          <!-- Indicadores de Desempenho -->
          <div class="section">
            <div class="section-title">Indicadores de Desempenho</div>
            @if (data.avaliacao.fisica.length > 0) {
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Teste</th>
                    <th>Resultado</th>
                    <th>Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  @for (teste of data.avaliacao.fisica; track teste.teste) {
                    <tr>
                      <td>{{ teste.teste }}</td>
                      <td>{{ teste.resultado }}</td>
                      <td>{{ teste.unidade }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="text-muted small fst-italic">Sem testes físicos informados.</div>
            }
            @if (data.avaliacao.tecnica.length > 0) {
              <table class="data-table" style="margin-top: 16px;">
                <thead>
                  <tr>
                    <th>Exercício</th>
                    <th>Precisão</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (exercicio of data.avaliacao.tecnica; track exercicio.exercicio) {
                    <tr>
                      <td>{{ exercicio.exercicio }}</td>
                      <td>
                        <span class="precision-badge">{{ calculatePrecision(exercicio.acertos, exercicio.tentativas) }}%</span>
                      </td>
                      <td>{{ exercicio.observacoes || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="text-muted small fst-italic">Sem exercícios técnicos informados.</div>
            }
          </div>


        </div>
      </div>

      <!-- Rodapé -->
      <div class="footer">
        <span>Relatório confidencial gerado pela plataforma Seu Olheiro</span>
        <span>Página 1 de 1</span>
      </div>
    </div>
  `
})
export class RelatorioAvaliacaoComponent {
  @Input() data!: RelatorioData;

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatBirthDate(dateStr: string): string {
    const date = new Date(dateStr);
    const age = new Date().getFullYear() - date.getFullYear();
    return `${date.toLocaleDateString('pt-BR')} (${age} anos)`;
  }

  skills(): Array<{ label: string; value: number }> {
    const t: any = this.data?.avaliacao?.tatica_comportamental || {};
    const entries: Array<[keyof typeof t, string]> = [
      ['posicionamento', 'Posicionamento'],
      ['leitura_jogo', 'Leitura de Jogo'],
      ['tomada_decisao', 'Tomada de Decisão'],
      ['disciplina_tatica', 'Disciplina Tática'],
      ['competitividade', 'Competitividade'],
      ['inteligencia_emocional', 'Inteligência Emocional']
    ];
    return entries
      .map(([k, label]) => {
        const v = typeof t[k] === 'number' ? (t[k] as number) : null;
        return v !== null ? { label, value: this.clamp0to10(v) } : null;
      })
      .filter((x): x is { label: string; value: number } => !!x);
  }

  private clamp0to10(n: number) {
    return Math.max(0, Math.min(10, n ?? 0));
  }

  calculatePrecision(acertos: number, tentativas: number): number {
    if (tentativas === 0) return 0;
    return Math.round((acertos / tentativas) * 100);
  }
}
