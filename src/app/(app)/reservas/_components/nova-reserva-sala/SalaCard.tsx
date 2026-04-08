'use client';

import { DoorOpen } from 'lucide-react';
import type { Sala } from '../../_lib/types';

interface SalaCardProps {
  sala: Sala;
  escritorioNome: string;
  selected: boolean;
  onClick: () => void;
}

export function SalaCard({ sala, escritorioNome, selected, onClick }: SalaCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: 12,
        borderRadius: 8,
        border: selected ? '2px solid #0D9488' : '1px solid #E2E8F0',
        background: selected ? '#F0FDFA' : '#FFFFFF',
        cursor: 'pointer',
        textAlign: 'left' as const,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.25s ease',
        outline: 'none',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: selected ? '#0D9488' : '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <DoorOpen size={20} style={{ color: selected ? '#FFFFFF' : '#64748B' }} />
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#1E293B',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {sala.nome}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#64748B',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {escritorioNome}
        </div>
      </div>
    </button>
  );
}
