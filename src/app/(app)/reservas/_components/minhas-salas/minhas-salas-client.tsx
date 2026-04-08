'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, CalendarX } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@/components/ui';
import { minhasReservasSala, cancelarReservaSala } from '../../_lib/reserva-sala.api';
import type { ReservaSala, ReservaSalaComDetalhes } from '../../_lib/types';
import { ReservaSalaCard } from './ReservaSalaCard';
import { EditarReservaSalaModal } from './EditarReservaSalaModal';

interface Props {
  token: string;
}

type TabValue = 'futuras' | 'passadas' | 'todas';

export function MinhasSalasClient({ token }: Props) {
  const [reservas, setReservas] = useState<ReservaSalaComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>('futuras');
  const [cancelarId, setCancelarId] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [editarReserva, setEditarReserva] = useState<ReservaSalaComDetalhes | null>(null);

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await minhasReservasSala(token, { limit: 100 });
      setReservas(res.items);
    } catch {
      toast.error('Falha ao carregar reservas.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const now = new Date();

  const filteredReservas = reservas.filter((r) => {
    const fimDate = new Date(r.dataHoraFim);
    if (tab === 'futuras') return r.isActive && fimDate > now;
    if (tab === 'passadas') return fimDate <= now;
    return true;
  });

  const sortedReservas = [...filteredReservas].sort((a, b) => {
    if (tab === 'futuras') return a.dataHoraInicio.localeCompare(b.dataHoraInicio);
    return b.dataHoraInicio.localeCompare(a.dataHoraInicio);
  });

  const handleConfirmarCancelamento = useCallback(async () => {
    if (!cancelarId) return;
    setCancelando(true);
    try {
      await cancelarReservaSala(token, cancelarId);
      setReservas((prev) => prev.map((r) => (r.id === cancelarId ? { ...r, isActive: false } : r)));
      toast.success('Reserva cancelada.');
    } catch {
      toast.error('Falha ao cancelar reserva.');
    } finally {
      setCancelando(false);
      setCancelarId(null);
    }
  }, [token, cancelarId]);

  const handleSaved = useCallback((updated: ReservaSala) => {
    setReservas((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  }, []);

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'futuras', label: 'Futuras' },
    { value: 'passadas', label: 'Passadas' },
    { value: 'todas', label: 'Todas' },
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1E293B',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Minhas Salas
        </h1>
        <Link href="/reservas/nova-reserva/sala" style={{ textDecoration: 'none' }}>
          <Button
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
            }}
          >
            <Plus size={16} /> Nova Reserva
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E2E8F0', marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: tab === t.value ? 600 : 400,
              fontFamily: 'Inter, sans-serif',
              color: tab === t.value ? '#0D9488' : '#64748B',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.value ? '2px solid #0D9488' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={24} style={{ color: '#0D9488', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Empty */}
      {!loading && sortedReservas.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 48,
            color: '#94A3B8',
          }}
        >
          <CalendarX size={40} style={{ marginBottom: 12 }} />
          <p
            style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', textAlign: 'center' as const }}
          >
            Nenhuma reserva encontrada.
          </p>
        </div>
      )}

      {/* Lista */}
      {!loading && sortedReservas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedReservas.map((reserva) => (
            <ReservaSalaCard
              key={reserva.id}
              reserva={reserva}
              onEditar={setEditarReserva}
              onCancelar={(id) => setCancelarId(id)}
            />
          ))}
        </div>
      )}

      {/* AlertDialog cancelamento */}
      <AlertDialog open={!!cancelarId} onOpenChange={(open) => !open && setCancelarId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelando}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarCancelamento}
              disabled={cancelando}
              style={{ background: '#EF4444', color: '#FFFFFF', border: 'none' }}
            >
              {cancelando ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                'Confirmar Cancelamento'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edicao */}
      {editarReserva && (
        <EditarReservaSalaModal
          reserva={editarReserva}
          token={token}
          open={!!editarReserva}
          onClose={() => setEditarReserva(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
