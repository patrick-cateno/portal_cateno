import { validateLogoutToken } from '@/lib/keycloak';
import { createAuditLog, AUTH_ACTIONS, getClientInfo } from '@/lib/audit';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const logoutToken = body.get('logout_token') as string;

    if (!logoutToken) {
      return new Response('Missing logout_token', { status: 400 });
    }

    // Validate the JWT logout token against Keycloak's JWKS
    const { sub } = await validateLogoutToken(logoutToken);

    // Find user by Keycloak subject ID
    const user = await prisma.user.findUnique({
      where: { keycloakSub: sub },
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Invalidate all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Clear stored tokens in Account
    await prisma.account.updateMany({
      where: { userId: user.id, provider: 'keycloak' },
      data: {
        access_token: null,
        refresh_token: null,
        expires_at: null,
      },
    });

    // Audit log
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      entity: 'Auth',
      action: AUTH_ACTIONS.BACKCHANNEL_LOGOUT,
      userId: user.id,
      changes: { keycloakSub: sub },
      ...clientInfo,
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Back-channel logout error:', error);
    return new Response('Invalid logout_token', { status: 400 });
  }
}
