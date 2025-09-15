import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { RelatorioAvaliacaoComponent } from '../../components/relatorio-avaliacao.component';
import { JogadoresService } from '../../services/jogadores.service';
import { AvaliacoesService } from '../../services/avaliacoes.service';
import { ClubesService } from '../../services/clubes.service';
import { AuthService } from '../../auth/auth.service';

import type { Jogador } from '../../models/player';
import type { Avaliacao } from '../../models/avaliacao';

@Component({
  standalone: true,
  selector: 'app-relatorio-avaliacao-page',
  imports: [CommonModule, RelatorioAvaliacaoComponent],
  styles: [`
    .page-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  `],
  template: `
  <div class="container">
    <div class="page-actions">
      <a class="btn btn-sm btn-link" (click)="onBack()"><i class="bi bi-arrow-left"></i> Voltar</a>
      <button class="btn btn-success btn-sm" (click)="onDownload()"><i class="bi bi-download"></i> Baixar</button>
    </div>

    @if (!data) {
      <div class="text-muted">Carregando...</div>
    } @else {
      <div #reportRef>
        <app-relatorio-avaliacao [data]="data" />
      </div>
    }
  </div>
  `
})
export class RelatorioAvaliacaoPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jogadoresSvc = inject(JogadoresService);
  private avaliacoesSvc = inject(AvaliacoesService);
  private clubesSvc = inject(ClubesService);
  private auth = inject(AuthService);

  @ViewChild('reportRef', { static: false }) reportRef!: ElementRef<HTMLElement>;

  data: any | null = null;

  jogadorId = Number(this.route.snapshot.paramMap.get('jogadorId'));
  avaliacaoId = Number(this.route.snapshot.paramMap.get('avaliacaoId'));

  constructor() {
    if (!this.jogadorId || !this.avaliacaoId) {
      this.router.navigate(['/jogadores']);
      return;
    }

    this.jogadoresSvc.get(this.jogadorId).subscribe({
      next: (j) => {
        this.avaliacoesSvc.byJogador(this.jogadorId).subscribe({
          next: (list) => {
            const a = list.find(x => x.id === this.avaliacaoId) as Avaliacao | undefined;
            this.data = this.buildRelatorioData(j, a);

            // Carrega detalhes completos da avaliação (física, técnica, tática)
            this.avaliacoesSvc.detalhes(this.avaliacaoId).subscribe({
              next: (det) => {
                if (!this.data) return;
                const fisica = Array.isArray(det?.fisica) ? det.fisica.map((t: any) => ({
                  tipo_teste: String(t?.tipo_teste || ''),
                  teste: String(t?.teste || ''),
                  resultado: String(t?.resultado || ''),
                  unidade: String(t?.unidade || '')
                })) : [];
                const tecnica = Array.isArray(det?.tecnica) ? det.tecnica.map((e: any) => ({
                  tipo_exercicio: String(e?.tipo_exercicio || ''),
                  exercicio: String(e?.exercicio || ''),
                  acertos: Number(e?.acertos || 0),
                  tentativas: Number(e?.tentativas || 0),
                  observacoes: e?.observacoes ? String(e.observacoes) : undefined
                })) : [];
                const tatica = det?.tatica_comportamental ?? this.data.avaliacao.tatica_comportamental;

                this.data = {
                  ...this.data,
                  avaliacao: {
                    ...this.data.avaliacao,
                    data_avaliacao: det?.data_avaliacao || this.data.avaliacao.data_avaliacao,
                    local_avaliacao: det?.local_avaliacao || this.data.avaliacao.local_avaliacao,
                    comentarios_gerais: det?.comentarios_gerais || this.data.avaliacao.comentarios_gerais,
                    fisica,
                    tecnica,
                    tatica_comportamental: tatica
                  }
                };
              }
            });

            // Enriquecimento com logo/nome do clube atual
            const cid = (j as any)?.clubeAtualId as number | null | undefined;
            if (cid) {
              this.clubesSvc.get(cid).subscribe({ next: (c) => {
                if (this.data) {
                  const nome = (j as any)?.clubeAtual?.nome || (c as any)?.nome || this.data.clube?.nome || '-';
                  this.data = { ...this.data, clube: { nome, logo_url: (c as any)?.foto || undefined } };
                }
              }});
            }
          }
        });
      }
    });
  }

  onBack() { history.back(); }

  async onDownload() {
    if (!this.reportRef?.nativeElement || !this.data) return;
    const { default: html2pdf } = await import('html2pdf.js');
    const el = this.reportRef.nativeElement as HTMLElement;
    const nomeJog = this.data?.jogador?.nome || 'Relatorio';
    const dt = new Date(this.data?.meta?.data_geracao || new Date().toISOString());
    const fileName = `${this.safeFileName(nomeJog)} - ${this.formatDate(dt)}.pdf`;

    const opt = {
      margin:       0,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css','avoid-all'] }
    } as any;

    await html2pdf().set(opt).from(el).save();
  }

  private safeFileName(input: string): string {
    const noAccents = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return noAccents
      .replace(/[^a-zA-Z0-9 _-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s/g, '-');
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  private buildRelatorioData(j: Jogador, a?: Avaliacao | undefined) {
    const user = this.auth.user();

    return {
      jogador: {
        nome: j.nome,
        foto_url: j.foto || undefined,
        data_nascimento: j.dataNascimento,
        posicao: j.posicao || '-',
        nacionalidade: j.nacionalidade || '-',
        bandeira_url: undefined,
        altura_m: j.altura ?? 0,
        peso_kg: j.peso ?? 0,
        pe_dominante: j.peDominante || '-'
      },
      clube: j.clubeAtual ? { nome: j.clubeAtual.nome, logo_url: undefined } : undefined,
      avaliacao: {
        data_avaliacao: a?.data || new Date().toISOString(),
        local_avaliacao: '-',
        comentarios_gerais: (a as any)?.comentarios || '',
        avaliador: { nome: user?.nome || '-' },
        fisica: [],
        tecnica: [],
        tatica_comportamental: {
          posicionamento: (a as any)?.posicionamento ?? null,
          leitura_jogo: (a as any)?.leituraJogo ?? null,
          tomada_decisao: (a as any)?.tomadaDecisao ?? null,
          disciplina_tatica: (a as any)?.disciplina ?? null,
          competitividade: (a as any)?.proatividade ?? null,
          inteligencia_emocional: (a as any)?.inteligenciaEmocional ?? null
        }
      },
      meta: {
        data_geracao: new Date().toISOString()
      }
    };
  }
}

