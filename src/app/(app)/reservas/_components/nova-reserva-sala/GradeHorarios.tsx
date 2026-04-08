'use client';

import { toast } from 'sonner';
import { gerarSlots, isToday } from '../../_lib/date-utils';
import type { ReservaSala } from '../../_lib/types';

interface GradeHorariosProps {
  dataReserva: string;
  reservas: ReservaSala[];
  rangeInicio: string | null;
  rangeFim: string | null;
  onRangeChange: (inicio: string | null, fim: string | null) => void;
}

type SlotStatus = 'livre' | 'ocupado' | 'passado' | 'selected' | 'inRange';

const slotStyles: Record<
  SlotStatus,
  { bg: string; border: string; color: string; cursor: string; opacity?: number }
> = {
  livre: { bg: '#F0FDFA', border: '1px solid #0D9488', color: '#334155', cursor: 'pointer' },
  ocupado: {
    bg: '#FEE2E2',
    border: '1px solid #EF4444',
    color: '#EF4444',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  passado: {
    bg: '#F1F5F9',
    border: '1px solid #E2E8F0',
    color: '#94A3B8',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  selected: { bg: '#0D9488', border: '1px solid #0F766E', color: '#FFFFFF', cursor: 'pointer' },
  inRange: { bg: '#CCFBF1', border: '1px solid #5EEAD4', color: '#0D9488', cursor: 'pointer' },
};

const legendaItems: { label: string; bg: string; border: string }[] = [
  { label: 'Livre', bg: '#F0FDFA', border: '#0D9488' },
  { label: 'Ocupado', bg: '#FEE2E2', border: '#EF4444' },
  { label: 'Passado', bg: '#F1F5F9', border: '#E2E8F0' },
  { label: 'Selecionado', bg: '#0D9488', border: '#0F766E' },
  { label: 'No intervalo', bg: '#CCFBF1', border: '#5EEAD4' },
];

function slotToMinutes(slot: string): number {
  const [h, m] = slot.split(':').map(Number);
  return h * 60 + m;
}

function isSlotPassado(slot: string, dataReserva: string): boolean {
  if (!isToday(dataReserva)) return false;
  const [h, m] = slot.split(':').map(Number);
  const now = new Date();
  const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  return slotDate <= now;
}

function isSlotOcupado(slot: string, dataReserva: string, reservas: ReservaSala[]): boolean {
  const [year, month, day] = dataReserva.split('-').map(Number);
  const [h, m] = slot.split(':').map(Number);
  const slotTime = new Date(year, month - 1, day, h, m).getTime();

  return reservas.some((r) => {
    if (!r.isActive) return false;
    const inicio = new Date(r.dataHoraInicio).getTime();
    const fim = new Date(r.dataHoraFim).getTime();
    return slotTime >= inicio && slotTime < fim;
  });
}

function hasOcupadoBetween(
  inicioSlot: string,
  fimSlot: string,
  dataReserva: string,
  reservas: ReservaSala[],
  allSlots: string[],
): boolean {
  const inicioIdx = allSlots.indexOf(inicioSlot);
  const fimIdx = allSlots.indexOf(fimSlot);
  const [lo, hi] = inicioIdx < fimIdx ? [inicioIdx, fimIdx] : [fimIdx, inicioIdx];
  for (let i = lo; i <= hi; i++) {
    if (isSlotOcupado(allSlots[i], dataReserva, reservas)) return true;
  }
  return false;
}

export default function GradeHorarios({
  dataReserva,
  reservas,
  rangeInicio,
  rangeFim,
  onRangeChange,
}: GradeHorariosProps) {
  const slots = gerarSlots();

  function getStatus(slot: string): SlotStatus {
    if (isSlotPassado(slot, dataReserva)) return 'passado';
    if (isSlotOcupado(slot, dataReserva, reservas)) return 'ocupado';
    if (slot === rangeInicio || slot === rangeFim) return 'selected';
    if (rangeInicio && rangeFim) {
      const sm = slotToMinutes(slot);
      const im = slotToMinutes(rangeInicio);
      const fm = slotToMinutes(rangeFim);
      if (sm > im && sm < fm) return 'inRange';
    }
    return 'livre';
  }

  function handleClick(slot: string) {
    if (isSlotPassado(slot, dataReserva)) return;
    if (isSlotOcupado(slot, dataReserva, reservas)) return;

    if (!rangeInicio) {
      onRangeChange(slot, null);
      return;
    }

    if (rangeInicio && !rangeFim) {
      const clickedMin = slotToMinutes(slot);
      const inicioMin = slotToMinutes(rangeInicio);

      if (clickedMin <= inicioMin) {
        onRangeChange(slot, null);
        return;
      }

      // fim = proximo slot apos o ultimo selecionado (para durar ate o fim do slot)
      const clickedIdx = slots.indexOf(slot);
      const fimHorario = clickedIdx + 1 < slots.length ? slots[clickedIdx + 1] : '18:00';

      if (hasOcupadoBetween(rangeInicio, slot, dataReserva, reservas, slots)) {
        toast.error('Ha horarios ocupados no intervalo selecionado.');
        return;
      }

      onRangeChange(rangeInicio, fimHorario);
      return;
    }

    // Ambos definidos: reset
    onRangeChange(slot, null);
  }

  return (
    <div>
      {!rangeInicio && (
        <p
          style={{
            fontSize: 13,
            color: '#64748B',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 12,
          }}
        >
          Clique no horario de inicio da reuniao.
        </p>
      )}
      {rangeInicio && !rangeFim && (
        <p
          style={{
            fontSize: 13,
            color: '#64748B',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 12,
          }}
        >
          Agora clique no horario de fim.
        </p>
      )}
      {rangeInicio && rangeFim && (
        <p
          style={{
            fontSize: 13,
            color: '#0D9488',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 12,
          }}
        >
          {rangeInicio} ate {rangeFim} selecionado. Clique em um slot para recomecar.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {slots.map((slot) => {
          const status = getStatus(slot);
          const style = slotStyles[status];
          return (
            <button
              key={slot}
              type="button"
              onClick={() => handleClick(slot)}
              disabled={status === 'ocupado' || status === 'passado'}
              style={{
                height: 40,
                borderRadius: 6,
                background: style.bg,
                border: style.border,
                color: style.color,
                cursor: style.cursor,
                opacity: style.opacity ?? 1,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.25s ease',
                outline: 'none',
                padding: 0,
              }}
            >
              {slot}
            </button>
          );
        })}
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
