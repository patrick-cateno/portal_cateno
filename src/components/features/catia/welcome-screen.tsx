'use client';

import { Sparkles, Activity, Star, Shield, HelpCircle, History } from 'lucide-react';

interface Props {
  onQuickAction: (prompt: string) => void;
  onOpenHistory?: () => void;
}

const quickActions = [
  {
    icon: Activity,
    label: 'Status de Apps',
    prompt: 'Qual é o status de todas as aplicações?',
  },
  {
    icon: Star,
    label: 'Populares',
    prompt: 'Quais são as aplicações mais populares?',
  },
  {
    icon: Shield,
    label: 'Anti-fraude',
    prompt: 'Abrir PLD/FT',
  },
  {
    icon: HelpCircle,
    label: 'Ajuda',
    prompt: 'Como posso usar a CatIA?',
  },
];

export function WelcomeScreen({ onQuickAction, onOpenHistory }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Sparkles className="h-16 w-16 text-teal-600" />
      <h2 className="mt-4 text-2xl font-bold text-neutral-900">Olá! Eu sou a CatIA</h2>
      <p className="mt-2 max-w-md text-center text-sm text-neutral-600">
        Sua assistente para navegar aplicações Cateno. Pergunte-me sobre apps, status, ou peça
        sugestões!
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onQuickAction(action.prompt)}
            className="flex flex-col items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-4 transition-colors hover:bg-teal-50"
          >
            <action.icon className="h-6 w-6 text-teal-600" />
            <span className="text-xs font-semibold text-neutral-900">{action.label}</span>
          </button>
        ))}
      </div>

      {onOpenHistory && (
        <button
          type="button"
          onClick={onOpenHistory}
          className="mt-6 flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-teal-600"
        >
          <History className="h-4 w-4" />
          Ver conversas anteriores
        </button>
      )}
    </div>
  );
}
