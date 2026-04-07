import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: Array<{
        id: string;
        applicationId: string;
        canView: boolean;
        canExecute: boolean;
      }>;
    } & DefaultSession['user'];
    accessToken?: string;
    error?: string;
  }

  interface User {
    keycloakSub?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    error?: string;
  }
}
