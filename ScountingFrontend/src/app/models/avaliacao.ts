export interface Avaliacao {
  id: number;
  jogadorId: number;
  avaliadorId: number;
  data: string; // ISO date (YYYY-MM-DD)
  // Técnica
  controleBola?: number | null;
  passe?: number | null;
  finalizacao?: number | null;
  drible?: number | null;
  // Tática
  posicionamento?: number | null;
  leituraJogo?: number | null;
  tomadaDecisao?: number | null;
  // Física
  velocidade?: number | null;
  resistencia?: number | null;
  forca?: number | null;
  // Psicológica
  disciplina?: number | null;
  lideranca?: number | null;
  proatividade?: number | null;
  inteligenciaEmocional?: number | null;

  comentarios?: string | null;
  notaFinal?: number | null;
}

export type AvaliacaoCreate = Omit<Avaliacao, 'id' | 'notaFinal'> & { notaFinal?: number | null };

