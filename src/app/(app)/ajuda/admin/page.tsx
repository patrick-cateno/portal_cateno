import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Aplicacoes } from '@/components/features/ajuda/admin/aplicacoes';
import { Categorias } from '@/components/features/ajuda/admin/categorias';
import { Permissoes } from '@/components/features/ajuda/admin/permissoes';
import { ToolRegistry } from '@/components/features/ajuda/admin/tool-registry';
import { Monitoramento } from '@/components/features/ajuda/admin/monitoramento';
import { Configuracao } from '@/components/features/ajuda/admin/configuracao';

export default async function AjudaAdminPage() {
  const session = await auth();
  const userRoles = session?.user?.roles ?? [];

  if (!userRoles.includes('admin')) {
    redirect('/aplicacoes');
  }

  return (
    <div className="space-y-12">
      <Aplicacoes />
      <Categorias />
      <Permissoes />
      <ToolRegistry />
      <Monitoramento />
      <Configuracao />
    </div>
  );
}
