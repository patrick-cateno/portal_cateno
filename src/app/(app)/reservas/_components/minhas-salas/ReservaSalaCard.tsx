'use client';

import { Calendar, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateBR, formatHorarioLocal, calcularDuracao } from '../../_lib/date-utils';
import type { ReservaSalaComDetalhes } from '../../_lib/types';

interface ReservaSalaCardProps {
  reserva: ReservaSalaComDetalhes;
  onEditar: (reserva: ReservaSalaComDetalhes) => void;
  onCancelar: (id: string) => void;
}

const badgeConfig: Record<string, { label: string; bg: string; color: string }> = {
  ativa: { label: 'Ativa', bg: '#ECFDF5', color: '#10B981' },
  cancelada: { label: 'Cancelada', bg: '#F1F5F9', color: '#64748B' },
};

export function ReservaSalaCard({ reserva, onEditar, onCancelar }: ReservaSalaCardProps) {
  const badge = reserva.isActive ? badgeConfig.ativa : badgeConfig.cancelada;
  const fimDate = new Date(reserva.dataHoraFim);
  const isEncerrada = fimDate <= new Date();
  const showActions = reserva.isActive && !isEncerrada;

  const inicio = formatHorarioLocal(reserva.dataHoraInicio);
  const fim = formatHorarioLocal(reserva.dataHoraFim);
  const duracao = calcularDuracao(inicio, fim);

  const dataStr = reserva.dataHoraInicio.slice(0, 10);
  const escritorioNome = reserva.sala?.escritorio
    ? `${reserva.sala.escritorio.cidade} — ${reserva.sala.escritorio.nome}`
    : '---';
  const salaNome = reserva.sala?.nome ?? '---';

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        border: '1px solid #E2E8F0',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} style={{ color: '#64748B' }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#1E293B',
                fontFamily: 'Inter, sans-serif',
                textTransform: 'capitalize' as const,
              }}
            >
              {formatDateBR(dataStr)} &middot; {inicio} - {fim}
              {duracao ? ` (${duracao})` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} style={{ color: '#64748B' }} />
            <span style={{ fontSize: 14, color: '#334155', fontFamily: 'Inter, sans-serif' }}>
              {salaNome} &middot; {escritorioNome}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: '#64748B' }} />
            <span style={{ fontSize: 14, color: '#334155', fontFamily: 'Inter, sans-serif' }}>
              {reserva.titulo}
            </span>
          </div>
        </div>

        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            background: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      </div>

      {showActions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <Button
            onClick={() => onEditar(reserva)}
            style={{
              background: '#0D9488',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              height: 36,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            onClick={() => onCancelar(reserva.id)}
            style={{
              color: '#EF4444',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              height: 36,
              padding: '0 12px',
            }}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
