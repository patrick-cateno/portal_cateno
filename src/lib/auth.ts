import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { refreshAccessToken } from '@/lib/auth-refresh';
import { extractKeycloakRoles } from '@/lib/keycloak';
import { createAuditLog, AUTH_ACTIONS } from '@/lib/audit';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      authorization: {
        params: { scope: 'openid profile email' },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          keycloakSub: profile.sub,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // First sign-in: store Keycloak tokens and sync user
      if (account && user) {
        token.accessToken = account.access_token ?? undefined;
        token.refreshToken = account.refresh_token ?? undefined;
        token.expiresAt = account.expires_at ?? undefined;
        token.id = user.id;

        // Extract roles from Keycloak profile
        const keycloakRoles = profile
          ? extractKeycloakRoles(profile as Record<string, unknown>)
          : ['user'];
        const portalRoles = keycloakRoles.length > 0 ? keycloakRoles : ['user'];
        token.roles = portalRoles;

        // Sync user and roles to database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { roles: true },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name,
              avatar: user.image,
              emailVerified: true,
              keycloakSub: (user as { keycloakSub?: string }).keycloakSub,
            },
          });

          // Sync roles: remove old, add new
          const existingRoleNames = existingUser.roles.map((r) => r.name);
          const rolesToAdd = portalRoles.filter((r) => !existingRoleNames.includes(r));
          const rolesToRemove = existingRoleNames.filter((r) => !portalRoles.includes(r));

          if (rolesToRemove.length > 0) {
            await prisma.role.deleteMany({
              where: {
                userId: existingUser.id,
                name: { in: rolesToRemove },
              },
            });
          }
          if (rolesToAdd.length > 0) {
            await prisma.role.createMany({
              data: rolesToAdd.map((name) => ({
                userId: existingUser.id,
                name,
              })),
            });
          }

          token.id = existingUser.id;
        } else {
          // Create new user (PrismaAdapter may have already created it)
          const newUser = await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              avatar: user.image,
              emailVerified: true,
              keycloakSub: (user as { keycloakSub?: string }).keycloakSub,
            },
            create: {
              email: user.email!,
              name: user.name,
              avatar: user.image,
              emailVerified: true,
              keycloakSub: (user as { keycloakSub?: string }).keycloakSub,
              roles: {
                create: portalRoles.map((name) => ({ name })),
              },
            },
          });
          token.id = newUser.id;
        }

        return token;
      }

      // Subsequent requests: check token expiry and refresh if needed
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt - 300) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          include: { roles: true, permissions: true },
        });

        session.user.roles = dbUser?.roles.map((r) => r.name) ?? [];
        session.user.permissions =
          dbUser?.permissions.map((p) => ({
            id: p.id,
            resource: p.resource,
            resourceId: p.resourceId,
            action: p.action,
          })) ?? [];

        if (token.error) {
          session.error = token.error;
        }
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      await createAuditLog({
        entity: 'Auth',
        action: AUTH_ACTIONS.LOGIN_SUCCESS,
        userId: user.id,
        changes: {
          provider: 'keycloak',
          keycloakSub: account?.providerAccountId,
        },
      });
    },
    async signOut(message) {
      const userId = 'token' in message ? (message.token?.id as string) : undefined;
      if (userId) {
        await createAuditLog({
          entity: 'Auth',
          action: AUTH_ACTIONS.LOGOUT,
          userId,
        });
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
