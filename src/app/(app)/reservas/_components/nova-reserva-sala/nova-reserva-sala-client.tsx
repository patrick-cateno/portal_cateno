'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { listarEscritorios } from '../../_lib/escritorio.api';
import { listarSalas } from '../../_lib/sala.api';
import { listarReservasSala, criarReservaSala } from '../../_lib/reserva-sala.api';
import { ApiError } from '../../_lib/client';
import {
  getMinDateSala,
  getMaxDate,
  isWeekend,
  formatDateBR,
  toUTCISO,
  calcularDuracao,
} from '../../_lib/date-utils';
import type { Escritorio, Sala, ReservaSala } from '../../_lib/types';
import { StepIndicator } from '../nova-reserva-estacao/StepIndicator';

const CardsSalas = dynamic(() => import('./CardsSalas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 192,
        width: '100%',
        borderRadius: 16,
        background: '#E2E8F0',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  ),
});

const GradeHorarios = dynamic(() => import('./GradeHorarios'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 256,
        width: '100%',
        borderRadius: 16,
        background: '#E2E8F0',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  ),
});

interface Props {
  token: string;
  userId: string;
}

type WizardStep = 1 | 2 | 3 | 'success';

const STEP_LABELS = ['Data e Escritorio', 'Sala e Horario', 'Titulo e Confirmacao'];

export function NovaReservaSalaClient({ token }: Props) {
  const [step, setStep] = useState<WizardStep>(1);

  // Passo 1
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);
  const [escritorioId, setEscritorioId] = useState('');
  const [dataReserva, setDataReserva] = useState('');
  const [loadingEscritorios, setLoadingEscritorios] = useState(true);
  const [loadingSalas, setLoadingSalas] = useState(false);

  // Passo 2
  const [salas, setSalas] = useState<Sala[]>([]);
  const [salaId, setSalaId] = useState<string | null>(null);
  const [reservasDaSala, setReservasDaSala] = useState<ReservaSala[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [rangeInicio, setRangeInicio] = useState<string | null>(null);
  const [rangeFim, setRangeFim] = useState<string | null>(null);

  // Passo 3
  const [titulo, setTitulo] = useState('');
  const [tituloError, setTituloError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Carregar escritorios
  const fetchEscritorios = useCallback(async () => {
    setLoadingEscritorios(true);
    try {
      const res = await listarEscritorios(token, { is_active: true, limit: 100 });
      setEscritorios(res.items);
    } catch {
      toast.error('Falha ao carregar escritorios.');
    } finally {
      setLoadingEscritorios(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEscritorios();
  }, [fetchEscritorios]);

  // Passo 1 → 2: buscar salas
  const handleVerSalas = useCallback(async () => {
    if (!escritorioId || !dataReserva) {
      toast.error('Selecione o escritorio e a data.');
      return;
    }
    setLoadingSalas(true);
    try {
      const res = await listarSalas(token, {
        escritorio_id: escritorioId,
        is_active: true,
        limit: 100,
      });
      setSalas(res.items);
      setSalaId(null);
      setReservasDaSala([]);
      setRangeInicio(null);
      setRangeFim(null);
      setStep(2);
    } catch {
      toast.error('Falha ao carregar salas.');
    } finally {
      setLoadingSalas(false);
    }
  }, [token, escritorioId, dataReserva]);

  // Ao selecionar uma sala: buscar reservas para verificar ocupacao
  const handleSelectSala = useCallback(
    async (id: string) => {
      setSalaId(id);
      setRangeInicio(null);
      setRangeFim(null);
      setLoadingReservas(true);
      try {
        const res = await listarReservasSala(token, {
          sala_id: id,
          data_inicio: dataReserva,
          data_fim: dataReserva,
          limit: 100,
        });
        setReservasDaSala(res.items);
      } catch {
        toast.error('Falha ao verificar disponibilidade.');
      } finally {
        setLoadingReservas(false);
      }
    },
    [token, dataReserva],
  );

  // Passo 3: confirmar reserva
  const handleConfirmar = useCallback(async () => {
    const tituloTrimmed = titulo.trim();
    if (tituloTrimmed.length < 3) {
      setTituloError('Titulo deve ter no minimo 3 caracteres.');
      return;
    }
    if (tituloTrimmed.length > 200) {
      setTituloError('Titulo deve ter no maximo 200 caracteres.');
      return;
    }
    if (!salaId || !rangeInicio || !rangeFim) return;

    setSubmitting(true);
    try {
      await criarReservaSala(token, {
        salaId,
        titulo: tituloTrimmed,
        dataHoraInicio: toUTCISO(dataReserva, rangeInicio),
        dataHoraFim: toUTCISO(dataReserva, rangeFim),
      });
      setStep('success');
      toast.success('Reserva criada com sucesso!');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'SALA_HORARIO_CONFLITO') {
          toast.error('Sala indisponivel no horario selecionado. Escolha outro horario.');
        } else if (error.code === 'HORARIO_PASSADO') {
          toast.error('O horario de inicio ja passou. Selecione um horario futuro.');
        } else if (error.code === 'FERIADO_NA_DATA') {
          const nome = (error.details?.nome as string) ?? '';
          toast.error(`Esta data e feriado${nome ? `: ${nome}` : '.'}`);
        } else {
          toast.error(error.message || 'Erro ao criar reserva. Tente novamente.');
        }
      } else {
        toast.error('Erro ao criar reserva. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [token, salaId, titulo, dataReserva, rangeInicio, rangeFim]);

  // Reset
  const handleNovaReserva = () => {
    setStep(1);
    setEscritorioId('');
    setDataReserva('');
    setSalas([]);
    setSalaId(null);
    setReservasDaSala([]);
    setRangeInicio(null);
    setRangeFim(null);
    setTitulo('');
    setTituloError('');
  };

  // Dados derivados
  const escritorioSelecionado = escritorios.find((e) => e.id === escritorioId);
  const escritorioNome = escritorioSelecionado
    ? `${escritorioSelecionado.cidade} — ${escritorioSelecionado.nome}`
    : '';
  const salaSelecionada = salas.find((s) => s.id === salaId);
  const duracao = rangeInicio && rangeFim ? calcularDuracao(rangeInicio, rangeFim) : '';

  const minDate = getMinDateSala();
  const maxDate = getMaxDate();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1E293B',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 24,
        }}
      >
        Nova Reserva de Sala
      </h1>

      {step !== 'success' && <StepIndicator steps={STEP_LABELS} current={step} />}

      {/* ============ PASSO 1 ============ */}
      {step === 1 && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #E2E8F0',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 20,
            }}
          >
            Escolha o escritorio e a data
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="escritorio-select"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                marginBottom: 6,
              }}
            >
              Escritorio
            </label>
            <select
              id="escritorio-select"
              value={escritorioId}
              onChange={(e) => setEscritorioId(e.target.value)}
              disabled={loadingEscritorios}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '0 12px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: escritorioId ? '#1E293B' : '#94A3B8',
                background: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="">
                {loadingEscritorios ? 'Carregando...' : 'Selecione o escritorio'}
              </option>
              {escritorios.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.cidade} — {e.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="data-reserva"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                marginBottom: 6,
              }}
            >
              Data da reserva
            </label>
            <input
              id="data-reserva"
              type="date"
              value={dataReserva}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val && isWeekend(val)) {
                  toast.error('Fins de semana nao sao permitidos.');
                  setDataReserva('');
                  return;
                }
                setDataReserva(val);
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

          <Button
            onClick={handleVerSalas}
            disabled={!escritorioId || !dataReserva || loadingSalas}
            style={{
              background: !escritorioId || !dataReserva ? '#94A3B8' : '#0D9488',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              height: 40,
              padding: '0 20px',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              cursor: !escritorioId || !dataReserva ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {loadingSalas ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                Ver salas disponiveis <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      )}

      {/* ============ PASSO 2 ============ */}
      {step === 2 && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #E2E8F0',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 4,
            }}
          >
            Escolha a sala e o horario
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 20,
            }}
          >
            {escritorioNome} &middot; {formatDateBR(dataReserva)}
          </p>

          <div style={{ display: 'flex', gap: 24, minHeight: 300 }}>
            {/* Painel esquerdo: salas */}
            <div style={{ width: 260, flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#64748B',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}
              >
                Salas
              </div>
              <CardsSalas
                salas={salas}
                escritorioNome={escritorioNome}
                salaId={salaId}
                onSelect={handleSelectSala}
              />
            </div>

            {/* Painel direito: grade de horarios */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#64748B',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}
              >
                Horarios
              </div>
              {!salaId && (
                <p
                  style={{
                    fontSize: 14,
                    color: '#94A3B8',
                    fontFamily: 'Inter, sans-serif',
                    padding: 12,
                  }}
                >
                  Selecione uma sala para ver os horarios.
                </p>
              )}
              {salaId && loadingReservas && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{ color: '#0D9488', animation: 'spin 1s linear infinite' }}
                  />
                </div>
              )}
              {salaId && !loadingReservas && (
                <GradeHorarios
                  dataReserva={dataReserva}
                  reservas={reservasDaSala}
                  rangeInicio={rangeInicio}
                  rangeFim={rangeFim}
                  onRangeChange={(inicio, fim) => {
                    setRangeInicio(inicio);
                    setRangeFim(fim);
                  }}
                />
              )}
            </div>
          </div>

          {/* Botoes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              <ArrowLeft size={16} /> Voltar
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!salaId || !rangeInicio || !rangeFim}
              style={{
                background: salaId && rangeInicio && rangeFim ? '#0D9488' : '#94A3B8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                height: 40,
                padding: '0 20px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                cursor: salaId && rangeInicio && rangeFim ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Avancar <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ============ PASSO 3 ============ */}
      {step === 3 && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #E2E8F0',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 20,
            }}
          >
            Titulo e confirmacao
          </h2>

          {/* Input titulo */}
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="titulo-reserva"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                marginBottom: 6,
              }}
            >
              Titulo da reuniao *
            </label>
            <input
              id="titulo-reserva"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setTituloError('');
              }}
              placeholder="Ex: Daily Standup, Revisao de Sprint..."
              maxLength={200}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: `1px solid ${tituloError ? '#EF4444' : '#E2E8F0'}`,
                padding: '0 12px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
            {tituloError && (
              <p
                style={{
                  fontSize: 12,
                  color: '#EF4444',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: 4,
                }}
              >
                {tituloError}
              </p>
            )}
          </div>

          {/* Resumo */}
          <div
            style={{
              background: '#F0FDFA',
              borderRadius: 8,
              padding: 20,
              border: '1px solid #E2E8F0',
              marginBottom: 24,
            }}
          >
            <SummaryRow label="Escritorio" value={escritorioNome} />
            <SummaryRow label="Data" value={formatDateBR(dataReserva)} capitalize />
            <SummaryRow label="Sala" value={salaSelecionada?.nome ?? '---'} />
            <SummaryRow
              label="Horario"
              value={
                rangeInicio && rangeFim
                  ? `${rangeInicio} ate ${rangeFim}${duracao ? ` — ${duracao}` : ''}`
                  : '---'
              }
              last
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
              }}
            >
              <ArrowLeft size={16} /> Voltar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={submitting}
              style={{
                background: '#0D9488',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                height: 40,
                padding: '0 20px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {submitting ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                'Confirmar Reserva'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ============ SUCESSO ============ */}
      {step === 'success' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 40,
            border: '1px solid #E2E8F0',
            textAlign: 'center' as const,
          }}
        >
          <CheckCircle2 size={56} style={{ color: '#10B981', marginBottom: 16 }} />
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 8,
            }}
          >
            Reserva confirmada!
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 4,
            }}
          >
            {escritorioNome}
          </p>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 4,
              textTransform: 'capitalize' as const,
            }}
          >
            {formatDateBR(dataReserva)}
          </p>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 4,
            }}
          >
            {salaSelecionada?.nome} &middot; {rangeInicio} ate {rangeFim}
            {duracao ? ` (${duracao})` : ''}
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 32,
            }}
          >
            {titulo}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Button
              variant="outline"
              onClick={handleNovaReserva}
              style={{
                borderRadius: 8,
                height: 40,
                padding: '0 20px',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                borderColor: '#E2E8F0',
                color: '#334155',
              }}
            >
              Fazer nova reserva
            </Button>
            <Link href="/reservas/minhas-salas" style={{ textDecoration: 'none' }}>
              <Button
                style={{
                  background: '#0D9488',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  height: 40,
                  padding: '0 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Ver minhas reservas
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  capitalize,
  last,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <p
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: '#1E293B',
          fontFamily: 'Inter, sans-serif',
          margin: '4px 0 0',
          textTransform: capitalize ? ('capitalize' as const) : undefined,
        }}
      >
        {value || '---'}
      </p>
    </div>
  );
}
