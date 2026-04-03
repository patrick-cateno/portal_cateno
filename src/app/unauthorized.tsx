import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <ShieldX className="text-primary-600 h-16 w-16" />
        <h1 className="text-2xl font-semibold text-neutral-900">Acesso necessario</h1>
        <p className="text-neutral-500">Voce precisa estar autenticado para acessar esta pagina.</p>
        <Link href="/login">
          <Button variant="primary">Fazer login</Button>
        </Link>
      </div>
    </div>
  );
}
