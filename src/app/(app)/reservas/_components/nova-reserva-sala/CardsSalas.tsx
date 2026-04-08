'use client';

import { SalaCard } from './SalaCard';
import type { Sala } from '../../_lib/types';

interface CardsSalasProps {
  salas: Sala[];
  escritorioNome: string;
  salaId: string | null;
  onSelect: (id: string) => void;
}

export default function CardsSalas({ salas, escritorioNome, salaId, onSelect }: CardsSalasProps) {
  if (salas.length === 0) {
    return (
      <p style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'Inter, sans-serif', padding: 12 }}>
        Nenhuma sala encontrada neste escritorio.
      </p>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        maxHeight: 500,
      }}
    >
      {salas.map((sala) => (
        <SalaCard
          key={sala.id}
          sala={sala}
          escritorioNome={escritorioNome}
          selected={salaId === sala.id}
          onClick={() => onSelect(sala.id)}
        />
      ))}
    </div>
  );
}
