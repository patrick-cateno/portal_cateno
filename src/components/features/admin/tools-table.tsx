'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { toggleTool } from '@/app/(app)/admin/tools/actions';

interface ToolRow {
  id: string;
  name: string;
  description: string;
  applicationName: string;
  method: string;
  endpoint: string;
  requiredRole: string | null;
  isActive: boolean;
}

function ToolToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleTool(id, !isActive);
          toast.success(isActive ? 'Tool desativada' : 'Tool ativada');
        });
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        isActive ? 'bg-teal-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function ToolsTable({ tools }: { tools: ToolRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Tool</th>
            <th className="px-4 py-3 font-medium text-gray-600">Aplicação</th>
            <th className="px-4 py-3 font-medium text-gray-600">Método</th>
            <th className="px-4 py-3 font-medium text-gray-600">Endpoint</th>
            <th className="px-4 py-3 font-medium text-gray-600">Role</th>
            <th className="px-4 py-3 font-medium text-gray-600">Ativa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tools.map((tool) => (
            <tr key={tool.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{tool.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">{tool.description}</p>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                  {tool.applicationName}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                  {tool.method}
                </span>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-500">
                {tool.endpoint}
              </td>
              <td className="px-4 py-3 text-gray-500">{tool.requiredRole ?? '—'}</td>
              <td className="px-4 py-3">
                <ToolToggle id={tool.id} isActive={tool.isActive} />
              </td>
            </tr>
          ))}
          {tools.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                Nenhuma tool registrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
