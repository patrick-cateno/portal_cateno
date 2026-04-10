'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Upload,
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
  listarEscritorios,
  criarEscritorio,
  atualizarEscritorio,
  excluirEscritorio,
  uploadPlantaBaixa,
} from '../../_lib/escritorio.api';
import type { Escritorio } from '../../_lib/types';

interface Props {
  token: string;
}

const PAGE_SIZE = 20;

export function EscritoriosPageClient({ token }: Props) {
  // Data state
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [busca, setBusca] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Escritorio | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formPlantaUrl, setFormPlantaUrl] = useState('');
  const [formUrlError, setFormUrlError] = useState('');
  const [plantaMode, setPlantaMode] = useState<'url' | 'upload'>('url');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFilePreview, setFormFilePreview] = useState('');
  const [formFileError, setFormFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Escritorio | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarEscritorios(token, {
        page,
        limit: PAGE_SIZE,
        is_active: mostrarInativos ? undefined : true,
      });
      setEscritorios(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Falha ao carregar escritórios');
    } finally {
      setLoading(false);
    }
  }, [token, page, mostrarInativos]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Local search filter
  const filtered = busca
    ? escritorios.filter(
        (e) =>
          e.nome.toLowerCase().includes(busca.toLowerCase()) ||
          e.cidade.toLowerCase().includes(busca.toLowerCase()),
      )
    : escritorios;

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  // Modal helpers
  function resetPlantaState() {
    setFormPlantaUrl('');
    setFormUrlError('');
    setFormFile(null);
    setFormFilePreview('');
    setFormFileError('');
    setPlantaMode('url');
  }

  function openCreate() {
    setEditando(null);
    setFormNome('');
    setFormCidade('');
    resetPlantaState();
    setModalOpen(true);
  }

  function openEdit(esc: Escritorio) {
    setEditando(esc);
    setFormNome(esc.nome);
    setFormCidade(esc.cidade);
    resetPlantaState();
    setFormPlantaUrl(esc.plantaBaixaUrl ?? '');
    setModalOpen(true);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormFileError('Tipo não permitido. Use JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormFileError('Arquivo excede o limite de 5 MB.');
      return;
    }

    setFormFileError('');
    setFormFile(file);
    setFormFilePreview(URL.createObjectURL(file));
  }

  function clearFile() {
    setFormFile(null);
    setFormFilePreview('');
    setFormFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSave() {
    // Validate URL mode
    if (plantaMode === 'url' && formPlantaUrl && !formPlantaUrl.startsWith('https://')) {
      setFormUrlError('URL deve começar com https://');
      return;
    }

    setSaving(true);
    try {
      let plantaUrl: string | null = null;

      if (plantaMode === 'upload' && formFile) {
        plantaUrl = await uploadPlantaBaixa(formFile);
      } else if (plantaMode === 'url' && formPlantaUrl) {
        plantaUrl = formPlantaUrl;
      }

      const body = {
        nome: formNome,
        cidade: formCidade,
        planta_baixa_url: plantaUrl,
      };

      if (editando) {
        await atualizarEscritorio(token, editando.id, body);
        toast.success('Escritório atualizado');
      } else {
        await criarEscritorio(token, body);
        toast.success('Escritório criado com sucesso');
      }

      setModalOpen(false);
      fetchData();
    } catch {
      toast.error(editando ? 'Falha ao atualizar escritório' : 'Falha ao criar escritório');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await excluirEscritorio(token, deleteTarget.id);
      toast.success('Escritório desativado');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Falha ao desativar escritório');
    } finally {
      setDeleting(false);
    }
  }

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
          Escritórios
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
          Novo Escritório
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              color: '#1E293B',
              outline: 'none',
            }}
          />
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            color: '#64748B',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={mostrarInativos}
            onChange={(e) => {
              setMostrarInativos(e.target.checked);
              setPage(1);
            }}
            style={{ accentColor: '#0D9488', width: 16, height: 16 }}
          />
          Mostrar inativos
        </label>
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
              <th
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
                Nome
              </th>
              <th
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
                Cidade
              </th>
              <th
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
                Status
              </th>
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
                          width: j === 3 ? 60 : '70%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
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
                    <Building2 size={40} style={{ color: '#94A3B8' }} />
                    <p style={{ color: '#64748B', fontSize: 14 }}>Nenhum escritório cadastrado</p>
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
                      Criar escritório
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((esc) => (
                <tr
                  key={esc.id}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    opacity: esc.isActive ? 1 : 0.6,
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
                    {esc.nome}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1E293B' }}>{esc.cidade}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        background: esc.isActive ? '#10B981' : '#64748B',
                      }}
                    >
                      {esc.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button
                        onClick={() => openEdit(esc)}
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
                      {esc.isActive && (
                        <button
                          onClick={() => setDeleteTarget(esc)}
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
                <ChevronLeft size={14} />
                Anterior
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
                Próximo
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Escritório' : 'Novo Escritório'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <Input
              label="Nome"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              placeholder="Ex: Sede São Paulo"
              required
            />
            <Input
              label="Cidade"
              value={formCidade}
              onChange={(e) => setFormCidade(e.target.value)}
              placeholder="Ex: São Paulo"
              required
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
                Planta Baixa
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 0,
                  marginBottom: 10,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  width: 'fit-content',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setPlantaMode('url');
                    clearFile();
                  }}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    background: plantaMode === 'url' ? '#0D9488' : '#FFFFFF',
                    color: plantaMode === 'url' ? '#FFFFFF' : '#64748B',
                    transition: 'all 0.25s ease',
                  }}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlantaMode('upload');
                    setFormPlantaUrl('');
                    setFormUrlError('');
                  }}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    borderLeft: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    background: plantaMode === 'upload' ? '#0D9488' : '#FFFFFF',
                    color: plantaMode === 'upload' ? '#FFFFFF' : '#64748B',
                    transition: 'all 0.25s ease',
                  }}
                >
                  Upload
                </button>
              </div>

              {plantaMode === 'url' ? (
                <Input
                  value={formPlantaUrl}
                  onChange={(e) => {
                    setFormPlantaUrl(e.target.value);
                    setFormUrlError('');
                  }}
                  placeholder="https://..."
                  error={!!formUrlError}
                  helperText={formUrlError}
                />
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  {formFilePreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Image
                        src={formFilePreview}
                        alt="Preview"
                        width={64}
                        height={64}
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        unoptimized
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span
                          style={{
                            fontSize: 13,
                            color: '#1E293B',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {formFile?.name}
                        </span>
                        <button
                          type="button"
                          onClick={clearFile}
                          style={{
                            fontSize: 12,
                            color: '#EF4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            textAlign: 'left',
                            padding: 0,
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '20px 16px',
                        border: '2px dashed #E2E8F0',
                        borderRadius: 8,
                        background: '#F8FAFC',
                        cursor: 'pointer',
                        color: '#64748B',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.25s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0D9488';
                        e.currentTarget.style.color = '#0D9488';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.color = '#64748B';
                      }}
                    >
                      <Upload size={16} />
                      Clique para selecionar (JPEG, PNG, WebP — max 5 MB)
                    </button>
                  )}
                  {formFileError && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#EF4444',
                        marginTop: 4,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {formFileError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <button
              onClick={handleSave}
              disabled={saving || !formNome.trim() || !formCidade.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background:
                  saving || !formNome.trim() || !formCidade.trim() ? '#94A3B8' : '#0D9488',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor:
                  saving || !formNome.trim() || !formCidade.trim() ? 'not-allowed' : 'pointer',
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
            <AlertDialogTitle>Desativar escritório?</AlertDialogTitle>
            <AlertDialogDescription>
              Salas e estações deste escritório não ficarão disponíveis para reservas.
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

      {/* Inline keyframes for skeleton pulse and spinner */}
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
