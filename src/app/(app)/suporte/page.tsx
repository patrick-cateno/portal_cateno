import { HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Suporte',
};

export default function SuportePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <HelpCircle className="h-12 w-12 text-neutral-300" />
      <h1 className="text-2xl font-semibold text-neutral-900">Suporte</h1>
      <p className="max-w-md text-neutral-500">
        Esta funcionalidade esta em desenvolvimento. Em breve voce podera abrir chamados e acessar a
        base de conhecimento.
      </p>
    </div>
  );
}
