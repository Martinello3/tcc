export interface Clube {
  id: number;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
}

export interface ClubeUpsert {
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
}

