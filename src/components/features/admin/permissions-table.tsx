'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { togglePermission } from '@/app/(app)/admin/permissoes/actions';

interface Props {
  users: Array<{ id: string; name: string; email: string }>;
  applications: Array<{ id: string; name: string; slug: string }>;
  permissionMap: Record<string, { canView: boolean; canExecute: boolean }>;
}

function PermissionCheckbox({
  userId,
  applicationId,
  field,
  checked,
}: {
  userId: string;
  applicationId: string;
  field: 'canView' | 'canExecute';
  checked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={isPending}
      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
      onChange={(e) => {
        startTransition(async () => {
          const result = await togglePermission(userId, applicationId, field, e.target.checked);
          if (result.success) {
            toast.success('Permissão atualizada');
          }
        });
      }}
    />
  );
}

export function PermissionsTable({ users, applications, permissionMap }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="sticky left-0 bg-gray-50 px-4 py-3 font-medium text-gray-600">
              Usuário
            </th>
            {applications.map((app) => (
              <th key={app.id} className="px-3 py-3 text-center font-medium text-gray-600">
                <span className="text-xs">{app.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </td>
              {applications.map((app) => {
                const key = `${user.id}:${app.id}`;
                const perm = permissionMap[key];
                return (
                  <td key={app.id} className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <PermissionCheckbox
                        userId={user.id}
                        applicationId={app.id}
                        field="canView"
                        checked={perm?.canView ?? false}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
