'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Monitor,
  Pencil,
  Plus,
  Unlock,
  X,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui';
import {
  listarEstacoes,
  criarEstacao,
  atualizarEstacao,
  excluirEstacao,
  bloquearEstacao,
  desbloquearEstacao,
} from '../../_lib/estacao.api';
import { listarEscritorios } from '../../_lib/escritorio.api';
import type { EstacaoTrabalho, Escritorio } from '../../_lib/types';

interface Props {
  token: string;
}

const PAGE_SIZE = 20;

type EstacaoStatus = 'disponivel' | 'bloqueada' | 'inativa';

function getEstacaoStatus(e: EstacaoTrabalho): EstacaoStatus {
  if (!e.isActive) return 'inativa';
  if (e.bloqueada) return 'bloqueada';
  return 'disponivel';
}

const statusConfig: Record<EstacaoStatus, { label: string; color: string; bg: string }> = {
  disponivel: { label: 'Disponível', color: '#10B981', bg: '#ECFDF5' },
  bloqueada: { label: 'Bloqueada', color: '#B45309', bg: '#FEF3C7' },
  inativa: { label: 'Inativa', color: '#64748B', bg: '#F1F5F9' },
};

type FiltroStatus = 'todas' | 'disponiveis' | 'bloqueadas';

export function EstacoesPageClient({ token }: Props) {
  // Data state
  const [estacoes, setEstacoes] = useState<EstacaoTrabalho[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);

  // Filters
  const [filtroEscritorio, setFiltroEscritorio] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<EstacaoTrabalho | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formEscritorioId, setFormEscritorioId] = useState('');

  // Action states
  const [deleteTarget, setDeleteTarget] = useState<EstacaoTrabalho | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [blockTarget, setBlockTarget] = useState<EstacaoTrabalho | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Load escritorios on mount
  useEffect(() => {
    listarEscritorios(token, { limit: 100, is_active: true })
      .then((res) => setEscritorios(res.items))
      .catch(() => toast.error('Falha ao carregar escritórios'));
  }, [token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        escritorio_id?: string;
        is_active?: boolean;
        bloqueada?: boolean;
      } = {
        page,
        limit: PAGE_SIZE,
        escritorio_id: filtroEscritorio || undefined,
      };

      if (filtroStatus === 'disponiveis') {
        params.is_active = true;
        params.bloqueada = false;
      } else if (filtroStatus === 'bloqueadas') {
        params.is_active = true;
        params.bloqueada = true;
      } else {
        params.is_active = true;
      }

      const res = await listarEstacoes(token, params);
      setEstacoes(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Falha ao carregar estações');
    } finally {
      setLoading(false);
    }
  }, [token, page, filtroEscritorio, filtroStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const escritorioMap = new Map(escritorios.map((e) => [e.id, e.nome]));

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  // Modal helpers
  function openCreate() {
    setEditando(null);
    setFormNome('');
    setFormEscritorioId(escritorios.length === 1 ? escritorios[0].id : '');
    setModalOpen(true);
  }

  function openEdit(est: EstacaoTrabalho) {
    setEditando(est);
    setFormNome(est.nome);
    setFormEscritorioId(est.escritorioId);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editando) {
        await atualizarEstacao(token, editando.id, {
          nome: formNome.trim(),
          escritorio_id: formEscritorioId,
        });
        toast.success('Estação atualizada');
      } else {
        await criarEstacao(token, {
          nome: formNome.trim(),
          escritorio_id: formEscritorioId,
          bloqueada: false,
        });
        toast.success('Estação criada com sucesso');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error(editando ? 'Falha ao atualizar estação' : 'Falha ao criar estação');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await excluirEstacao(token, deleteTarget.id);
      toast.success('Estação desativada');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Falha ao desativar estação');
    } finally {
      setDeleting(false);
    }
  }

  async function handleBlock() {
    if (!blockTarget) return;
    setBlocking(true);
    try {
      await bloquearEstacao(token, blockTarget.id);
      toast.success('Estação bloqueada');
      setBlockTarget(null);
      fetchData();
    } catch {
      toast.error('Falha ao bloquear estação');
    } finally {
      setBlocking(false);
    }
  }

  async function handleUnblock(est: EstacaoTrabalho) {
    setActioningId(est.id);
    try {
      await desbloquearEstacao(token, est.id);
      toast.success('Estação desbloqueada');
      fetchData();
    } catch {
      toast.error('Falha ao desbloquear estação');
    } finally {
      setActioningId(null);
    }
  }

  const canSave = formNome.trim().length > 0 && formNome.trim().length <= 50 && !!formEscritorioId;

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: '#0F172A',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Estações de Trabalho
        </h1>
        <button
          onClick={openCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#0D9488',
            color: '#FFF',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0F766E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0D9488';
          }}
        >
          <Plus size={16} />
          Nova Estação
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={filtroEscritorio}
          onChange={(e) => {
            setFiltroEscritorio(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            color: '#1E293B',
            background: '#FFFFFF',
            minWidth: 200,
          }}
        >
          <option value="">Todos os escritórios</option>
          {escritorios.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => {
            setFiltroStatus(e.target.value as FiltroStatus);
            setPage(1);
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            color: '#1E293B',
            background: '#FFFFFF',
            minWidth: 160,
          }}
        >
          <option value="todas">Todas</option>
          <option value="disponiveis">Disponíveis</option>
          <option value="bloqueadas">Bloqueadas</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              {['Nome', 'Escritório', 'Status'].map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#64748B',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {col}
                </th>
              ))}
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: '#64748B',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          height: 16,
                          background: '#E2E8F0',
                          borderRadius: 4,
                          width: j === 3 ? 80 : '60%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : estacoes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 48, textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Monitor size={40} style={{ color: '#94A3B8' }} />
                    <p style={{ color: '#64748B', fontSize: 14 }}>Nenhuma estação cadastrada</p>
                    <button
                      onClick={openCreate}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#0D9488',
                        color: '#FFF',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      Criar estação
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              estacoes.map((est) => {
                const status = getEstacaoStatus(est);
                const cfg = statusConfig[status];
                const isActioning = actioningId === est.id;

                return (
                  <tr
                    key={est.id}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      opacity: est.isActive ? 1 : 0.6,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: '#1E293B', fontWeight: 500 }}>
                      {est.nome}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1E293B' }}>
                      {escritorioMap.get(est.escritorioId) ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 500,
                          color: cfg.color,
                          background: cfg.bg,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        {est.isActive && (
                          <>
                            <button
                              onClick={() => openEdit(est)}
                              title="Editar"
                              style={{
                                padding: 6,
                                borderRadius: 6,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#64748B',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F1F5F9';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <Pencil size={16} />
                            </button>

                            {!est.bloqueada ? (
                              <button
                                onClick={() => setBlockTarget(est)}
                                title="Bloquear"
                                style={{
                                  padding: 6,
                                  borderRadius: 6,
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#B45309',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#FEF3C7';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <Lock size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblock(est)}
                                title="Desbloquear"
                                disabled={isActioning}
                                style={{
                                  padding: 6,
                                  borderRadius: 6,
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: isActioning ? 'wait' : 'pointer',
                                  color: '#10B981',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActioning) e.currentTarget.style.background = '#ECFDF5';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                {isActioning ? (
                                  <Loader2
                                    size={16}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                  />
                                ) : (
                                  <Unlock size={16} />
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => setDeleteTarget(est)}
                              title="Desativar"
                              style={{
                                padding: 6,
                                borderRadius: 6,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#EF4444',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FEF2F2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: '1px solid #E2E8F0',
              fontSize: 13,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span>
              Mostrando {rangeStart}–{rangeEnd} de {total} registros
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1,
                  fontSize: 13,
                }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.5 : 1,
                  fontSize: 13,
                }}
              >
                Próximo <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Estação' : 'Nova Estação'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <Input
              label="Nome"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              placeholder="Ex: A-01, Mesa 12"
              required
              maxLength={50}
            />
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1E293B',
                  marginBottom: 6,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Escritório <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={formEscritorioId}
                onChange={(e) => setFormEscritorioId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  color: formEscritorioId ? '#1E293B' : '#94A3B8',
                  background: '#FFFFFF',
                }}
              >
                <option value="" disabled>
                  Selecione um escritório
                </option>
                {escritorios.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: saving || !canSave ? '#94A3B8' : '#0D9488',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: saving || !canSave ? 'not-allowed' : 'pointer',
                minWidth: 100,
              }}
            >
              {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block AlertDialog */}
      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear estação {blockTarget?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>Ela ficará indisponível para reservas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={blocking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={blocking}
              style={{ background: '#B45309', color: '#FFFFFF' }}
            >
              {blocking ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : null}
              Bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar estação {deleteTarget?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação remove a estação do catálogo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : null}
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
