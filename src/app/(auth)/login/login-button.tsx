'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { loginAction } from '@/lib/auth-actions';

const ERROR_MESSAGES: Record<string, string> = {
  SessionExpired: 'Sua sessao expirou. Faca login novamente.',
  OAuthCallback: 'Erro ao processar a autenticacao. Tente novamente.',
  OAuthSignin: 'Erro ao conectar com o servico de autenticacao.',
  Default: 'Servico de autenticacao indisponivel. Tente novamente.',
};

export function LoginButton() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? (ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.Default) : null,
  );

  async function handleLogin() {
    try {
      setIsLoading(true);
      setError(null);
      await loginAction();
    } catch {
      setError(ERROR_MESSAGES.Default);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
        {isLoading ? 'Conectando...' : 'Entrar com Login Cateno'}
      </Button>

      {error && (
        <p className="text-center text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
