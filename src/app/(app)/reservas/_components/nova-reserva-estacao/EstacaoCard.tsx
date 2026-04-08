'use client';

type EstacaoStatus = 'livre' | 'reservada' | 'bloqueada' | 'inativa';

interface EstacaoCardProps {
  nome: string;
  status: EstacaoStatus;
  selected: boolean;
  isOwnReservation: boolean;
  onClick: () => void;
}

const statusStyles: Record<
  EstacaoStatus,
  { bg: string; border: string; cursor: string; opacity?: number }
> = {
  livre: { bg: '#F0FDFA', border: '#0D9488', cursor: 'pointer' },
  reservada: { bg: '#F1F5F9', border: '#CBD5E1', cursor: 'not-allowed', opacity: 0.7 },
  bloqueada: { bg: '#FEF3C7', border: '#F59E0B', cursor: 'not-allowed' },
  inativa: { bg: '#F8FAFC', border: '#E2E8F0', cursor: 'not-allowed', opacity: 0.4 },
};

const statusLabels: Record<EstacaoStatus, string> = {
  livre: 'Livre',
  reservada: 'Reservada',
  bloqueada: 'Bloqueada',
  inativa: 'Inativa',
};

export function EstacaoCard({
  nome,
  status,
  selected,
  isOwnReservation,
  onClick,
}: EstacaoCardProps) {
  const style = statusStyles[status];
  const isClickable = status === 'livre';

  const bg = selected ? '#0D9488' : style.bg;
  const border = selected ? '#0F766E' : style.border;
  const color = selected ? '#FFFFFF' : '#334155';
  const borderWidth = isOwnReservation && !selected ? 3 : 2;
  const borderStyle = isOwnReservation && !selected ? ('double' as const) : ('solid' as const);

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      style={{
        width: 80,
        height: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 8,
        borderWidth,
        borderStyle,
        borderColor: border,
        background: bg,
        color,
        cursor: isClickable ? 'pointer' : 'not-allowed',
        opacity: style.opacity ?? 1,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.25s ease',
        padding: 0,
        outline: 'none',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{nome}</span>
      <span style={{ fontSize: 10, fontWeight: 400, opacity: selected ? 0.9 : 0.7, lineHeight: 1 }}>
        {isOwnReservation && !selected ? 'Sua reserva' : statusLabels[status]}
      </span>
    </button>
  );
}
