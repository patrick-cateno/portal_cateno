import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/app/(app)/admin/permissoes/actions', () => ({
  togglePermission: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { PermissionsTable } from '@/components/features/admin/permissions-table';

const users = [
  { id: 'u1', name: 'Viewer One', email: 'v1@test.com' },
  { id: 'u2', name: 'Viewer Two', email: 'v2@test.com' },
];

const applications = [
  { id: 'app-1', name: 'App A', slug: 'app-a' },
  { id: 'app-2', name: 'App B', slug: 'app-b' },
];

const permissionMap = {
  'u1:app-1': { canView: true, canExecute: false },
};

describe('PermissionsTable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders users and applications', () => {
    render(
      <PermissionsTable users={users} applications={applications} permissionMap={permissionMap} />,
    );
    expect(screen.getByText('Viewer One')).toBeInTheDocument();
    expect(screen.getByText('Viewer Two')).toBeInTheDocument();
    expect(screen.getByText('App A')).toBeInTheDocument();
    expect(screen.getByText('App B')).toBeInTheDocument();
  });

  it('renders checkboxes for each user-app pair', () => {
    render(
      <PermissionsTable users={users} applications={applications} permissionMap={permissionMap} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // 2 users x 2 apps = 4 checkboxes
    expect(checkboxes).toHaveLength(4);
  });

  it('checks the checkbox for existing permission', () => {
    render(
      <PermissionsTable users={users} applications={applications} permissionMap={permissionMap} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox (u1:app-1) should be checked
    expect(checkboxes[0]).toBeChecked();
  });
});
