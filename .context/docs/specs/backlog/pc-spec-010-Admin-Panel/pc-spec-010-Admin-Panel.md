# PC-SPEC-010 — Admin Panel: Gestão de Aplicações

| Campo            | Valor                    |
| ---------------- | ------------------------ |
| **ID**           | PC-SPEC-010              |
| **Status**       | Backlog                  |
| **Prioridade**   | Média                    |
| **Complexidade** | Média                    |
| **Autor**        | Patrick Iarrocheski      |
| **Branch**       | feat/PC-010-admin-panel  |

## 1. Objetivo

Implementar o painel de administração para que usuários com role `admin` possam gerenciar o catálogo de aplicações: criar, editar, reordenar e excluir aplicações e categorias, além de configurar permissões por usuário.

## 2. Escopo

### 2.1 Incluído

- Rota protegida `/admin` (guard: role `admin`)
- CRUD de Aplicações (criar, editar, arquivar)
- CRUD de Categorias (criar, editar, reordenar por drag-and-drop)
- Gestão de Permissões: definir quais users com role `viewer` têm acesso a quais apps
- Visualização de saúde das apps (status, uptime, último check)
- Tabela com paginação, busca e ordenação
- Form validado com Zod + React Hook Form
- Feedback visual (toast) para todas as operações

### 2.2 Excluído

- Gestão de usuários (Keycloak é responsável)
- Analytics avançados de uso
- Configuração de roles (gerenciado no Keycloak)

## 3. Estrutura de rotas

```
src/app/(app)/admin/
├── layout.tsx                # Guard: requireRole('admin')
├── page.tsx                  # Dashboard admin (overview)
├── aplicacoes/
│   ├── page.tsx              # Lista de aplicações
│   ├── nova/
│   │   └── page.tsx          # Formulário criar
│   └── [slug]/
│       └── editar/
│           └── page.tsx      # Formulário editar
├── categorias/
│   └── page.tsx              # Lista + CRUD inline
└── permissoes/
    └── page.tsx              # Tabela user x app
```

## 4. Formulário de Aplicação

```typescript
// Validação com Zod
const applicationSchema = z.object({
  name: z.string().min(3).max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(200),
  categoryId: z.string().cuid(),
  icon: z.string(),           // Nome do ícone Lucide
  integrationType: z.enum(['redirect', 'embed', 'modal']),
  url: z.string().url().optional(),
  healthCheckUrl: z.string().url(),
  order: z.number().int().default(99),
});
```

## 5. Server Actions

```typescript
// src/app/(app)/admin/aplicacoes/actions.ts
'use server';
import { requireRole } from '@/lib/auth';

export async function createApplication(data: ApplicationFormData) {
  await requireRole('admin');
  // valida com Zod, cria no Prisma, revalida cache
  revalidatePath('/aplicacoes');
}

export async function archiveApplication(id: string) {
  await requireRole('admin');
  await prisma.application.update({
    where: { id },
    data: { status: 'archived' },
  });
  revalidatePath('/aplicacoes');
  revalidatePath('/admin/aplicacoes');
}
```

## 6. Tabela de Aplicações (Admin)

| Coluna | Tipo |
|--------|------|
| Nome + ícone | Visual |
| Categoria | Badge |
| Status | Dot colorido |
| Último health check | Tempo relativo |
| Usuários ativos | Número |
| Ações | Editar / Arquivar |

## 7. Critérios de Aceite

- [ ] Rota /admin bloqueada para não-admins (redirect para /aplicacoes)
- [ ] CRUD completo de aplicações funcionando
- [ ] CRUD de categorias com reordenação
- [ ] Gestão de permissões viewer por app
- [ ] Formulários validados com Zod
- [ ] Toast de feedback para todas as operações
- [ ] Tabela com paginação e busca

## 8. Dependências

- **Depende de:** PC-SPEC-007 (API), PC-SPEC-008 (schema), PC-SPEC-002 (auth)
- **Não é bloqueante** para outras specs
