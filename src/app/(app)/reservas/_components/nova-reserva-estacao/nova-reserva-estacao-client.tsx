'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { listarEscritorios } from '../../_lib/escritorio.api';
import { buscarDisponibilidade, criarReservaEstacao } from '../../_lib/reserva-estacao.api';
import { ApiError } from '../../_lib/client';
import { getMinDate, getMaxDate, isWeekend, formatDateBR } from '../../_lib/date-utils';
import type { Escritorio, DisponibilidadeEstacao } from '../../_lib/types';
import { StepIndicator } from './StepIndicator';

const GradeEstacoes = dynamic(() => import('./GradeEstacoes'), {
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

interface Props {
  token: string;
  userId: string;
}

type WizardStep = 1 | 2 | 3 | 'success';

const STEP_LABELS = ['Data e Local', 'Escolher Estacao', 'Confirmacao'];

export function NovaReservaEstacaoClient({ token, userId }: Props) {
  const [step, setStep] = useState<WizardStep>(1);

  // Passo 1
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);
  const [escritorioId, setEscritorioId] = useState('');
  const [dataReserva, setDataReserva] = useState('');
  const [loadingEscritorios, setLoadingEscritorios] = useState(true);
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false);

  // Passo 2
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeEstacao | null>(null);
  const [estacaoSelecionada, setEstacaoSelecionada] = useState<string | null>(null);

  // Passo 3
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

  // Passo 1 → 2: buscar disponibilidade
  const handleVerDisponibilidade = useCallback(async () => {
    if (!escritorioId || !dataReserva) {
      toast.error('Selecione o escritorio e a data.');
      return;
    }
    setLoadingDisponibilidade(true);
    try {
      const res = await buscarDisponibilidade(token, { escritorioId, data: dataReserva });
      setDisponibilidade(res);
      setEstacaoSelecionada(null);
      setStep(2);
    } catch {
      toast.error('Falha ao buscar disponibilidade.');
    } finally {
      setLoadingDisponibilidade(false);
    }
  }, [token, escritorioId, dataReserva]);

  // Passo 3: confirmar reserva
  const handleConfirmar = useCallback(async () => {
    if (!estacaoSelecionada) return;
    setSubmitting(true);
    try {
      await criarReservaEstacao(token, { estacaoId: estacaoSelecionada, dataReserva });
      setStep('success');
      toast.success('Reserva criada com sucesso!');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'RESERVA_JA_EXISTE_NA_DATA') {
          toast.error('Voce ja tem uma reserva para este dia.');
        } else if (error.code === 'FERIADO_NA_DATA') {
          const nome = (error.details?.nome as string) ?? '';
          toast.error(`Esta data e feriado${nome ? `: ${nome}` : '.'}`);
        } else {
          toast.error('Erro ao criar reserva. Tente novamente.');
        }
      } else {
        toast.error('Erro ao criar reserva. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [token, estacaoSelecionada, dataReserva]);

  // Reset do wizard para nova reserva
  const handleNovaReserva = () => {
    setStep(1);
    setEscritorioId('');
    setDataReserva('');
    setDisponibilidade(null);
    setEstacaoSelecionada(null);
  };

  // Dados derivados
  const escritorioSelecionado = escritorios.find((e) => e.id === escritorioId);
  const estacaoNome =
    disponibilidade?.estacoes.find((e) => e.id === estacaoSelecionada)?.nome ?? '';

  const minDate = getMinDate();
  const maxDate = getMaxDate();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1E293B',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 24,
        }}
      >
        Nova Reserva de Estacao
      </h1>

      {/* Stepper (nao exibe na tela de sucesso) */}
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

          {/* Select de escritorio */}
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

          {/* Input de data */}
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
            onClick={handleVerDisponibilidade}
            disabled={!escritorioId || !dataReserva || loadingDisponibilidade}
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
            {loadingDisponibilidade ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                Ver disponibilidade
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      )}

      {/* ============ PASSO 2 ============ */}
      {step === 2 && disponibilidade && (
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
            Escolha sua estacao
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 20,
            }}
          >
            {escritorioSelecionado
              ? `${escritorioSelecionado.cidade} — ${escritorioSelecionado.nome}`
              : ''}{' '}
            &middot; {formatDateBR(dataReserva)}
          </p>

          <GradeEstacoes
            estacoes={disponibilidade.estacoes}
            selecionada={estacaoSelecionada}
            userId={userId}
            onSelect={setEstacaoSelecionada}
          />

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
              <ArrowLeft size={16} />
              Voltar
            </Button>

            <Button
              onClick={() => setStep(3)}
              disabled={!estacaoSelecionada}
              style={{
                background: estacaoSelecionada ? '#0D9488' : '#94A3B8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                height: 40,
                padding: '0 20px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                cursor: estacaoSelecionada ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Avancar
              <ArrowRight size={16} />
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
            Confirme sua reserva
          </h2>

          {/* Card de resumo */}
          <div
            style={{
              background: '#F0FDFA',
              borderRadius: 8,
              padding: 20,
              border: '1px solid #E2E8F0',
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 12 }}>
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
                Escritorio
              </span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1E293B',
                  fontFamily: 'Inter, sans-serif',
                  margin: '4px 0 0',
                }}
              >
                {escritorioSelecionado
                  ? `${escritorioSelecionado.cidade} — ${escritorioSelecionado.nome}`
                  : '---'}
              </p>
            </div>
            <div style={{ marginBottom: 12 }}>
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
                Data
              </span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1E293B',
                  fontFamily: 'Inter, sans-serif',
                  margin: '4px 0 0',
                  textTransform: 'capitalize' as const,
                }}
              >
                {formatDateBR(dataReserva)}
              </p>
            </div>
            <div>
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
                Estacao
              </span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1E293B',
                  fontFamily: 'Inter, sans-serif',
                  margin: '4px 0 0',
                }}
              >
                {estacaoNome || '---'}
              </p>
            </div>
          </div>

          {/* Botoes */}
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
              <ArrowLeft size={16} />
              Voltar
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
              marginBottom: 8,
            }}
          >
            {escritorioSelecionado
              ? `${escritorioSelecionado.cidade} — ${escritorioSelecionado.nome}`
              : ''}
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
              fontWeight: 500,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 32,
            }}
          >
            Estacao {estacaoNome}
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
            <Link href="/reservas/minhas-estacoes" style={{ textDecoration: 'none' }}>
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
