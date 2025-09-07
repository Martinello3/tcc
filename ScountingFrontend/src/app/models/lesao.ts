export interface Lesao {
  id: number;
  jogadorId: number;
  descricao: string;
  dataOcorrencia: string; // ISO date (yyyy-MM-dd)
  dataRecuperacao?: string | null; // ISO date (yyyy-MM-dd)
  tipoLesao?: string | null; // 'M','L','O','C','N'
  localCorpo?: string | null; // 'JL','TB','CM','OM','CT','OT'
  observacoes?: string | null;
}

export interface LesaoUpsert {
  jogadorId: number;
  descricao: string;
  dataOcorrencia: string; // ISO date
  dataRecuperacao?: string | null;
  tipoLesao?: string | null;
  localCorpo?: string | null;
  observacoes?: string | null;
}

