'use server';

import { signIn, signOut } from '@/lib/auth';
import { getKeycloakLogoutUrl } from '@/lib/keycloak';

export async function loginAction() {
  await signIn('keycloak', { redirectTo: '/aplicacoes' });
}

export async function logoutAction() {
  await signOut({ redirect: false });
  const logoutUrl = getKeycloakLogoutUrl(`${process.env.NEXTAUTH_URL}/login`);
  return { redirectUrl: logoutUrl };
}
