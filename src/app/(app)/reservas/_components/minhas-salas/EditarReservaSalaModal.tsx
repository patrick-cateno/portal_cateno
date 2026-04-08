'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { atualizarReservaSala } from '../../_lib/reserva-sala.api';
import { ApiError } from '../../_lib/client';
import {
  formatHorarioLocal,
  gerarSlots,
  getMinDateSala,
  getMaxDate,
  isWeekend,
  toUTCISO,
} from '../../_lib/date-utils';
import type { ReservaSala, ReservaSalaComDetalhes } from '../../_lib/types';

interface EditarReservaSalaModalProps {
  reserva: ReservaSalaComDetalhes;
  token: string;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: ReservaSala) => void;
}

const slots = gerarSlots();
const slotsComFim = [...slots.slice(1), '18:00'];

export function EditarReservaSalaModal({
  reserva,
  token,
  open,
  onClose,
  onSaved,
}: EditarReservaSalaModalProps) {
  const inicioOriginal = formatHorarioLocal(reserva.dataHoraInicio);
  const fimOriginal = formatHorarioLocal(reserva.dataHoraFim);
  const dataOriginal = reserva.dataHoraInicio.slice(0, 10);

  const [titulo, setTitulo] = useState(reserva.titulo);
  const [data, setData] = useState(dataOriginal);
  const [horarioInicio, setHorarioInicio] = useState(inicioOriginal);
  const [horarioFim, setHorarioFim] = useState(fimOriginal);
  const [inlineError, setInlineError] = useState('');
  const [saving, setSaving] = useState(false);

  const salaNome = reserva.sala?.nome ?? '---';
  const minDate = getMinDateSala();
  const maxDate = getMaxDate();

  // Opcoes de fim filtradas: apenas > inicio selecionado
  const inicioIdx = slots.indexOf(horarioInicio);
  const fimOptions = inicioIdx >= 0 ? slotsComFim.slice(inicioIdx) : slotsComFim;

  const canSave =
    titulo.trim().length >= 3 &&
    titulo.trim().length <= 200 &&
    data &&
    horarioInicio &&
    horarioFim &&
    horarioFim > horarioInicio;

  async function handleSave() {
    if (!canSave) return;

    if (horarioFim <= horarioInicio) {
      setInlineError('Horario fim deve ser posterior ao inicio.');
      return;
    }

    setSaving(true);
    setInlineError('');

    const body: Partial<{ titulo: string; dataHoraInicio: string; dataHoraFim: string }> = {};
    if (titulo.trim() !== reserva.titulo) body.titulo = titulo.trim();

    const novoInicio = toUTCISO(data, horarioInicio);
    const novoFim = toUTCISO(data, horarioFim);
    if (novoInicio !== reserva.dataHoraInicio) body.dataHoraInicio = novoInicio;
    if (novoFim !== reserva.dataHoraFim) body.dataHoraFim = novoFim;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    try {
      const updated = await atualizarReservaSala(token, reserva.id, body);
      toast.success('Reserva atualizada.');
      onSaved(updated);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SALA_CONFLITO_HORARIO') {
        setInlineError('Horario indisponivel — escolha outro.');
      } else {
        toast.error('Erro ao atualizar reserva.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle>Editar Reserva — {salaNome}</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
          {/* Titulo */}
          <div>
            <label
              htmlFor="edit-titulo"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                marginBottom: 6,
              }}
            >
              Titulo
            </label>
            <input
              id="edit-titulo"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setInlineError('');
              }}
              maxLength={200}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '0 12px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          {/* Data */}
          <div>
            <label
              htmlFor="edit-data"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                marginBottom: 6,
              }}
            >
              Data
            </label>
            <input
              id="edit-data"
              type="date"
              value={data}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val && isWeekend(val)) {
                  toast.error('Fins de semana nao sao permitidos.');
                  return;
                }
                setData(val);
                setInlineError('');
              }}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '0 12px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          {/* Horarios */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="edit-inicio"
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: 6,
                }}
              >
                Inicio
              </label>
              <select
                id="edit-inicio"
                value={horarioInicio}
                onChange={(e) => {
                  setHorarioInicio(e.target.value);
                  // Ajustar fim se necessario
                  if (e.target.value >= horarioFim) {
                    const idx = slots.indexOf(e.target.value);
                    setHorarioFim(
                      idx >= 0 && idx < slotsComFim.length ? slotsComFim[idx] : '18:00',
                    );
                  }
                  setInlineError('');
                }}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  padding: '0 12px',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                  background: '#FFFFFF',
                  outline: 'none',
                }}
              >
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="edit-fim"
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: 6,
                }}
              >
                Fim
              </label>
              <select
                id="edit-fim"
                value={horarioFim}
                onChange={(e) => {
                  setHorarioFim(e.target.value);
                  setInlineError('');
                }}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  padding: '0 12px',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                  background: '#FFFFFF',
                  outline: 'none',
                }}
              >
                {fimOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Erro inline */}
          {inlineError && (
            <p
              style={{ fontSize: 13, color: '#EF4444', fontFamily: 'Inter, sans-serif', margin: 0 }}
            >
              {inlineError}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              background: canSave ? '#0D9488' : '#94A3B8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              height: 40,
              padding: '0 20px',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {saving ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
