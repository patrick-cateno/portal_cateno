'use client';

import { Calendar, Building2, Monitor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateBR, formatTimeBR, isToday, getToday } from '../../_lib/date-utils';
import type { ReservaEstacaoComDetalhes } from '../../_lib/types';

interface ReservaEstacaoCardProps {
  reserva: ReservaEstacaoComDetalhes;
  onCheckin: (id: string) => void;
  onCancelar: (id: string) => void;
  checkingInId: string | null;
}

const badgeConfig: Record<string, { label: string; bg: string; color: string }> = {
  confirmada: { label: 'Confirmada', bg: '#ECFDF5', color: '#10B981' },
  concluida: { label: 'Concluida', bg: '#F0FDFA', color: '#0D9488' },
  cancelada: { label: 'Cancelada', bg: '#F1F5F9', color: '#64748B' },
};

export function ReservaEstacaoCard({
  reserva,
  onCheckin,
  onCancelar,
  checkingInId,
}: ReservaEstacaoCardProps) {
  const badge = badgeConfig[reserva.situacao] ?? badgeConfig.confirmada;
  const today = getToday();
  const reservaIsToday = isToday(reserva.dataReserva);
  const reservaIsFuture = reserva.dataReserva >= today;

  const showCheckin =
    reserva.situacao === 'confirmada' && reservaIsToday && !reserva.checkinRealizado;
  const showCheckinDone = reserva.situacao === 'confirmada' && reserva.checkinRealizado;
  const showCancelar = reserva.situacao === 'confirmada' && reservaIsFuture;
  const isCheckingIn = checkingInId === reserva.id;

  const escritorioNome = reserva.estacao?.escritorio
    ? `${reserva.estacao.escritorio.cidade} — ${reserva.estacao.escritorio.nome}`
    : '---';
  const estacaoNome = reserva.estacao?.nome ?? '---';

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
        {/* Info */}
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
              {formatDateBR(reserva.dataReserva)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} style={{ color: '#64748B' }} />
            <span
              style={{
                fontSize: 14,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {escritorioNome}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={16} style={{ color: '#64748B' }} />
            <span
              style={{
                fontSize: 14,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Estacao {estacaoNome}
            </span>
          </div>
        </div>

        {/* Badge */}
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

      {/* Actions */}
      {(showCheckin || showCheckinDone || showCancelar) && (
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
          {showCheckin && (
            <Button
              onClick={() => onCheckin(reserva.id)}
              disabled={isCheckingIn}
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
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: isCheckingIn ? 'not-allowed' : 'pointer',
              }}
            >
              {isCheckingIn ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                'Check-in'
              )}
            </Button>
          )}

          {showCheckinDone && reserva.checkinTimestamp && (
            <span
              style={{
                fontSize: 13,
                color: '#10B981',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              &#10003; Check-in realizado as {formatTimeBR(reserva.checkinTimestamp)}
            </span>
          )}

          {showCancelar && (
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
          )}
        </div>
      )}
    </div>
  );
}
