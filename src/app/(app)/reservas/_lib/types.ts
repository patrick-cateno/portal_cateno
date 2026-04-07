// Tipos TypeScript derivados dos contratos reais do ms-reservas

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

export interface Escritorio {
  id: string;
  nome: string;
  cidade: string;
  plantaBaixaUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sala {
  id: string;
  nome: string;
  escritorioId: string;
  fotoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EstacaoTrabalho {
  id: string;
  nome: string;
  escritorioId: string;
  isActive: boolean;
  bloqueada: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feriado {
  id: string;
  escritorioId: string | null; // null = nacional
  data: string; // YYYY-MM-DD
  nome: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SituacaoReservaEstacao = 'confirmada' | 'cancelada' | 'concluida';

export interface ReservaEstacao {
  id: string;
  estacaoId: string;
  dataReserva: string; // YYYY-MM-DD
  userId: string;
  situacao: SituacaoReservaEstacao;
  checkinRealizado: boolean;
  checkinTimestamp: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservaSala {
  id: string;
  salaId: string;
  titulo: string;
  dataHoraInicio: string; // ISO 8601
  dataHoraFim: string; // ISO 8601
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DisponibilidadeEstacao {
  escritorioId: string;
  data: string;
  estacoes: {
    id: string;
    nome: string;
    status: 'livre' | 'reservada' | 'bloqueada' | 'inativa';
    reservaId?: string;
    userId?: string;
  }[];
}
