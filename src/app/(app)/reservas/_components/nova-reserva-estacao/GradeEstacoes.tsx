'use client';

import { EstacaoCard } from './EstacaoCard';
import type { DisponibilidadeEstacao } from '../../_lib/types';

interface GradeEstacoesProps {
  estacoes: DisponibilidadeEstacao['estacoes'];
  selecionada: string | null;
  userId: string;
  onSelect: (estacaoId: string) => void;
}

const legendaItems: { label: string; bg: string; border: string }[] = [
  { label: 'Livre', bg: '#F0FDFA', border: '#0D9488' },
  { label: 'Reservada', bg: '#F1F5F9', border: '#CBD5E1' },
  { label: 'Bloqueada', bg: '#FEF3C7', border: '#F59E0B' },
  { label: 'Inativa', bg: '#F8FAFC', border: '#E2E8F0' },
];

export default function GradeEstacoes({
  estacoes,
  selecionada,
  userId,
  onSelect,
}: GradeEstacoesProps) {
  const visiveis = estacoes.filter((e) => e.status !== 'inativa');

  return (
    <div>
      {/* Grid de estacoes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {visiveis.map((estacao) => (
          <EstacaoCard
            key={estacao.id}
            nome={estacao.nome}
            status={estacao.status}
            selected={selecionada === estacao.id}
            isOwnReservation={estacao.status === 'reservada' && estacao.userId === userId}
            onClick={() => onSelect(estacao.id)}
          />
        ))}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {legendaItems.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: item.bg,
                border: `2px solid ${item.border}`,
              }}
            />
            <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
