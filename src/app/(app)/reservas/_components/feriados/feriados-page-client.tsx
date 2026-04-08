'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Loader2, Pencil, Plus, X } from 'lucide-react';
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
  listarFeriados,
  criarFeriado,
  atualizarFeriado,
  excluirFeriado,
} from '../../_lib/feriado.api';
import { listarEscritorios } from '../../_lib/escritorio.api';
import type { Feriado, Escritorio } from '../../_lib/types';

interface Props {
  token: string;
}

function formatDate(dateStr: string): string {
  // API may return "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ"
  const dateOnly = dateStr.slice(0, 10);
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    weekday: 'long',
  }).format(date);
  // "segunda-feira, 25/12/2025" → "25/12/2025 (Segunda-feira)"
  const parts = formatted.split(', ');
  if (parts.length === 2) {
    const weekday = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return `${parts[1]} (${weekday})`;
  }
  return formatted;
}

function toDateOnly(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

type FiltroAbrangencia = 'todos' | 'nacional' | string; // string = escritorio UUID

export function FeriadosPageClient({ token }: Props) {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);

  // Filters
  const [filtroAno, setFiltroAno] = useState(currentYear);
  const [filtroAbrangencia, setFiltroAbrangencia] = useState<FiltroAbrangencia>('todos');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Feriado | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [formNome, setFormNome] = useState('');
  const [formData, setFormData] = useState('');
  const [formAbrangencia, setFormAbrangencia] = useState<'nacional' | 'escritorio'>('nacional');
  const [formEscritorioId, setFormEscritorioId] = useState('');
  const [formNomeError, setFormNomeError] = useState('');
  const [formDataError, setFormDataError] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Feriado | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listarEscritorios(token, { limit: 100, is_active: true })
      .then((res) => setEscritorios(res.items))
      .catch(() => toast.error('Falha ao carregar escritórios'));
  }, [token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarFeriados(token, {
        ano: filtroAno,
        is_active: true,
      });
      // Sort by date ASC
      const sorted = [...res.items].sort((a, b) =>
        toDateOnly(a.data).localeCompare(toDateOnly(b.data)),
      );
      // Client-side filter by abrangência
      const filtered =
        filtroAbrangencia === 'todos'
          ? sorted
          : filtroAbrangencia === 'nacional'
            ? sorted.filter((f) => f.escritorioId === null)
            : sorted.filter((f) => f.escritorioId === filtroAbrangencia);
      setFeriados(filtered);
      setTotal(filtered.length);
    } catch {
      toast.error('Falha ao carregar feriados');
    } finally {
      setLoading(false);
    }
  }, [token, filtroAno, filtroAbrangencia]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const escritorioMap = new Map(escritorios.map((e) => [e.id, e.nome]));

  // Modal helpers
  function openCreate() {
    setEditando(null);
    setFormNome('');
    setFormData('');
    setFormAbrangencia('nacional');
    setFormEscritorioId(escritorios.length === 1 ? escritorios[0].id : '');
    setFormNomeError('');
    setFormDataError('');
    setModalOpen(true);
  }

  function openEdit(feriado: Feriado) {
    setEditando(feriado);
    setFormNome(feriado.nome);
    setFormData(toDateOnly(feriado.data));
    setFormAbrangencia(feriado.escritorioId === null ? 'nacional' : 'escritorio');
    setFormEscritorioId(feriado.escritorioId ?? '');
    setFormNomeError('');
    setFormDataError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormNomeError('');
    setFormDataError('');

    if (formNome.trim().length < 2) {
      setFormNomeError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (!editando && formData < getTomorrow()) {
      setFormDataError('Data não pode ser anterior a amanhã');
      return;
    }

    setSaving(true);
    try {
      const escritorio_id = formAbrangencia === 'nacional' ? null : formEscritorioId;

      if (editando) {
        const payload: Record<string, unknown> = {
          nome: formNome.trim(),
          escritorio_id,
        };
        // Only send data if it changed and is in the future
        if (formData !== toDateOnly(editando.data) && formData >= getToday()) {
          payload.data = formData;
        }
        await atualizarFeriado(token, editando.id, payload);
        toast.success('Feriado atualizado');
      } else {
        await criarFeriado(token, {
          nome: formNome.trim(),
          data: formData,
          escritorio_id,
        });
        toast.success('Feriado criado');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error(editando ? 'Falha ao atualizar feriado' : 'Falha ao criar feriado');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await excluirFeriado(token, deleteTarget.id);
      toast.success('Feriado desativado');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Falha ao desativar feriado');
    } finally {
      setDeleting(false);
    }
  }

  const isEditDataPast = editando ? toDateOnly(editando.data) < getToday() : false;
  const canSave =
    formNome.trim().length >= 2 &&
    (editando ? true : !!formData) &&
    (formAbrangencia === 'nacional' || !!formEscritorioId);

  return (
    <div>
      {/* Header */}
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
          Feriados
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
          Novo Feriado
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
          value={filtroAno}
          onChange={(e) => setFiltroAno(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            color: '#1E293B',
            background: '#FFFFFF',
            minWidth: 120,
          }}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={filtroAbrangencia}
          onChange={(e) => setFiltroAbrangencia(e.target.value)}
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
          <option value="todos">Todos</option>
          <option value="nacional">🌐 Nacional</option>
          {escritorios.map((e) => (
            <option key={e.id} value={e.id}>
              🏢 {e.nome}
            </option>
          ))}
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
              {['Data', 'Nome', 'Abrangência', 'Status'].map((col) => (
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
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          height: 16,
                          background: '#E2E8F0',
                          borderRadius: 4,
                          width: j === 4 ? 60 : '60%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : feriados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 48, textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Calendar size={40} style={{ color: '#94A3B8' }} />
                    <p style={{ color: '#64748B', fontSize: 14 }}>
                      Nenhum feriado cadastrado para este período
                    </p>
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
                      Criar feriado
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              feriados.map((fer) => (
                <tr
                  key={fer.id}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    opacity: fer.isActive ? 1 : 0.6,
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
                    {formatDate(fer.data)}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1E293B' }}>{fer.nome}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {fer.escritorioId === null ? (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#0D9488',
                          background: '#F0FDFA',
                        }}
                      >
                        🌐 Nacional
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#1D4ED8',
                          background: '#EFF6FF',
                        }}
                      >
                        🏢 {escritorioMap.get(fer.escritorioId) ?? 'Escritório'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        background: fer.isActive ? '#10B981' : '#64748B',
                      }}
                    >
                      {fer.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button
                        onClick={() => openEdit(fer)}
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
                      {fer.isActive && (
                        <button
                          onClick={() => setDeleteTarget(fer)}
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
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && total > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #E2E8F0',
              fontSize: 13,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {total} feriado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Feriado' : 'Novo Feriado'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <Input
              label="Nome"
              value={formNome}
              onChange={(e) => {
                setFormNome(e.target.value);
                setFormNomeError('');
              }}
              placeholder="Ex: Natal, Aniversário de SP"
              required
              error={!!formNomeError}
              helperText={formNomeError}
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
                Data <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                value={formData}
                onChange={(e) => {
                  setFormData(e.target.value);
                  setFormDataError('');
                }}
                min={editando ? undefined : getTomorrow()}
                disabled={isEditDataPast}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${formDataError ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                  background: '#FFFFFF',
                  ...(isEditDataPast ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                }}
              />
              {formDataError && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#EF4444',
                    marginTop: 4,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {formDataError}
                </p>
              )}
              {isEditDataPast && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#64748B',
                    marginTop: 4,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Data no passado — apenas nome e abrangência podem ser alterados
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1E293B',
                  marginBottom: 8,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Abrangência <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    color: '#1E293B',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="abrangencia"
                    checked={formAbrangencia === 'nacional'}
                    onChange={() => setFormAbrangencia('nacional')}
                    style={{ accentColor: '#0D9488' }}
                  />
                  🌐 Nacional (aplica a todos os escritórios)
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    color: '#1E293B',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="abrangencia"
                    checked={formAbrangencia === 'escritorio'}
                    onChange={() => setFormAbrangencia('escritorio')}
                    style={{ accentColor: '#0D9488' }}
                  />
                  🏢 Escritório específico
                </label>
              </div>

              {formAbrangencia === 'escritorio' && (
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
                    marginTop: 8,
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
              )}
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

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar feriado?</AlertDialogTitle>
            <AlertDialogDescription>
              Feriado desativado não bloqueará mais reservas nesta data.
            </AlertDialogDescription>
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
