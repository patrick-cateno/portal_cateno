'use client';

import { AppShell } from '@/components/layout';

/**
 * Pagina temporaria para visualizar o layout sem Keycloak.
 * Remover antes de ir para producao.
 */
export default function DemoPage() {
  return (
    <AppShell userRoles={['admin']}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Portal Cateno — Demo</h1>
        <p className="text-neutral-600">
          Esta pagina demonstra o layout completo (header, sidebar, breadcrumb) sem necessidade de
          autenticacao via Keycloak.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {['Header + Logo', 'Sidebar Collapsible', 'View Toggle'].map((title) => (
            <div
              key={title}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1 text-sm text-neutral-500">Funcionando</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> Esta pagina eh apenas para desenvolvimento. O dropdown de usuario
            nao tera dados reais (useSession retorna null sem auth). Para testar o fluxo completo,
            configure o Keycloak no <code>.env.local</code>.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">Teste interativo</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600">
            <li>Clique no icone do hamburger (desktop) para colapsar/expandir a sidebar</li>
            <li>
              Use{' '}
              <kbd className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-xs">
                Ctrl+K
              </kbd>{' '}
              para abrir o search overlay
            </li>
            <li>Clique no avatar (canto superior direito) para abrir o dropdown</li>
            <li>Alterne entre &quot;Aplicacoes&quot; e &quot;CatIA&quot; no toggle do header</li>
            <li>Redimensione a janela para &lt; 768px para ver o mobile nav</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
