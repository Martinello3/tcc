export interface Video {
  id: number;
  jogadorId: number;
  caminhoVideo?: string | null;
  dataEnvio?: string | null; // ISO
  marcacoes?: string | null;
}

export interface VideoUpsert {
  jogadorId: number;
  caminhoVideo?: string | null;
  dataEnvio?: string | null;
  marcacoes?: string | null;
}

