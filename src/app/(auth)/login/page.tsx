import { Suspense } from 'react';
import { CatenoLogo } from '@/components/ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { LoginButton } from './login-button';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <div className="from-primary-600 to-primary-800 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <CatenoLogo size="lg" variant="white" />

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-neutral-900">Bem-vindo ao CatIA Super App</CardTitle>
            <CardDescription>Acesse suas aplicacoes</CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={
                <div className="flex h-11 items-center justify-center">
                  <span className="text-sm text-neutral-500">Carregando...</span>
                </div>
              }
            >
              <LoginButton />
            </Suspense>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-xs text-neutral-400">Autenticacao segura via Keycloak</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
