import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: Array<{
        id: string;
        resource: string;
        resourceId: string | null;
        action: string;
      }>;
    } & DefaultSession['user'];
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
