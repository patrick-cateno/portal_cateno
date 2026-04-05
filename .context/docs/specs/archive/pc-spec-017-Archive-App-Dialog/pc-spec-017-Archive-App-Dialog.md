# PC-SPEC-017 — Archive App Dialog (shadcn/ui AlertDialog)

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | PC-SPEC-017                      |
| **Status**       | Concluída (2026-04-05)           |
| **Prioridade**   | Baixa — UX, não é bloqueante     |
| **Complexidade** | Baixa                            |
| **Origem**       | Falha B5 nos testes manuais      |
| **Autor**        | Patrick Iarrocheski              |
| **Branch**       | feat/PC-017-archive-app-dialog   |

## 1. Problema identificado nos testes

**Teste B5 falhou:** ao clicar no ícone de arquivamento de um app no Admin Panel,
o dialog de confirmação não aparecia consistentemente. O `confirm()` nativo do browser
é bloqueado por extensões (como ad blockers) e algumas configurações corporativas.

## 2. Solução

Substituir o `confirm()` nativo pelo componente `AlertDialog` do shadcn/ui — já
disponível no projeto, consistente com o Design System Cateno e não bloqueável
por extensões de browser.

## 3. Localização do código

```bash
# Encontrar onde confirm() é usado para arquivar apps
grep -r "confirm\|archive\|arquiv" src/app/\(app\)/admin/ --include="*.tsx"
```

Provavelmente em:
- `src/app/(app)/admin/aplicacoes/page.tsx`
- `src/components/features/admin/ApplicationsTable.tsx` (ou similar)

## 4. Implementação

### 4.1 Substituir confirm() por AlertDialog

```tsx
// ANTES — confirm() nativo (bloqueável)
const handleArchive = async (appId: string) => {
  if (confirm('Tem certeza que deseja arquivar esta aplicação?')) {
    await archiveApplication(appId);
  }
};

// DEPOIS — AlertDialog shadcn/ui
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function ArchiveAppButton({ appId, appName }: { appId: string; appName: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-neutral-400 hover:text-warning transition-colors"
          title="Arquivar aplicação"
        >
          <Archive size={16} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivar aplicação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja arquivar <strong>{appName}</strong>?
            A aplicação não aparecerá mais no catálogo, mas pode ser restaurada posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => archiveApplication(appId)}
            className="bg-warning hover:bg-warning/90 text-white"
          >
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4.2 Aplicar o mesmo padrão para Deletar Categoria

Verificar se o botão de deletar categoria também usa `confirm()` e aplicar
o mesmo padrão de AlertDialog para consistência.

```bash
grep -r "confirm" src/app/\(app\)/admin/categorias/ --include="*.tsx"
```

## 5. Critérios de aceite

- [ ] Botão de arquivar app abre AlertDialog shadcn/ui (não confirm() nativo)
- [ ] Dialog mostra nome da aplicação na mensagem de confirmação
- [ ] Botão "Arquivar" no dialog aciona a Server Action corretamente
- [ ] Botão "Cancelar" fecha o dialog sem executar ação
- [ ] Verificar se deletar categoria também usa confirm() — corrigir se sim
- [ ] Teste B5 aprovado: dialog abre consistentemente em qualquer browser/extensão

## 6. Dependências

- **Depende de:** PC-SPEC-010 (Admin Panel)
- **Não é bloqueante** para outras specs
