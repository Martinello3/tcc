export interface Relatorio {
  id: number;
  jogadorId: number;
  avaliacaoId: number;
  caminhoPdf?: string | null;
  dataGeracao?: string | null; // ISO string
}

