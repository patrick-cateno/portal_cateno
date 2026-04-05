import { Home } from 'lucide-react';

export const metadata = {
  title: 'Inicio',
};

export default function InicioPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Home className="h-12 w-12 text-neutral-300" />
      <h1 className="text-2xl font-semibold text-neutral-900">Inicio</h1>
      <p className="max-w-md text-neutral-500">
        Pagina inicial em desenvolvimento. Em breve voce tera um resumo das suas aplicacoes e
        atividades recentes.
      </p>
    </div>
  );
}
