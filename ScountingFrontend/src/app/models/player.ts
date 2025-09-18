export interface Jogador {
  id: number;
  nome: string;
  dataNascimento: string; // ISO date
  nacionalidade?: string | null;
  posicao?: string | null;
  altura?: number | null;
  peso?: number | null;
  peDominante?: string | null;
  clubeAtualId?: number | null;
  clubeAtual?: { id: number; nome: string; foto?: string | null } | null;
  foto?: string | null;
  observacoes?: string | null;
  // Campos de insight entregues pela API na listagem
  notaGeral?: number | null;
}

export interface JogadorUpsert {
  nome: string;
  dataNascimento: string; // ISO date (yyyy-MM-dd)
  nacionalidade?: string | null;
  posicao?: string | null;
  altura?: number | null;
  peso?: number | null;
  peDominante?: string | null;
  clubeAtualId?: number | null;
  foto?: string | null;
  observacoes?: string | null;
}

