import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-semibold text-neutral-900">Acesso proibido</h1>
        <p className="text-neutral-500">Voce nao tem permissao para acessar esta pagina.</p>
        <Link href="/aplicacoes">
          <Button variant="secondary">Voltar ao inicio</Button>
        </Link>
      </div>
    </div>
  );
}
