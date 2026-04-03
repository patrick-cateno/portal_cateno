'use client';

import { useSession } from 'next-auth/react';
import { User, Settings, LogOut } from 'lucide-react';
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui';
import { logoutAction } from '@/lib/auth-actions';

export function UserDropdown() {
  const { data: session } = useSession();
  const user = session?.user;

  async function handleLogout() {
    const result = await logoutAction();
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger className="focus:ring-primary-600 rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none">
        <Avatar name={user?.name} src={user?.image} size="sm" />
      </DropdownTrigger>

      <DropdownContent align="right" className="w-60">
        {/* User info header */}
        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {user?.name ?? 'Usuario'}
          </p>
          <p className="truncate text-xs text-neutral-500">{user?.email}</p>
        </div>

        <DropdownSeparator />

        <DropdownItem onClick={() => {}}>
          <User className="h-4 w-4 text-neutral-500" />
          Meu Perfil
        </DropdownItem>
        <DropdownItem onClick={() => {}}>
          <Settings className="h-4 w-4 text-neutral-500" />
          Configuracoes
        </DropdownItem>

        <DropdownSeparator />

        <DropdownItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
