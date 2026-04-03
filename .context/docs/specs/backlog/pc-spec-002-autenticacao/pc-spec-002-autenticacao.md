# PC-SPEC-002 — Sistema de Autenticação

| Campo            | Valor                    |
| ---------------- | ------------------------ |
| **ID**           | PC-SPEC-002              |
| **Status**       | Backlog                  |
| **Prioridade**   | Crítica                  |
| **Complexidade** | Alta                     |
| **Criado em**    | 2026-04-03               |
| **Autor**        | Patrick Iarrocheski      |
| **Branch**       | feat/PC-002-autenticacao |

## 1. Objetivo

Implementar um sistema de autenticação robusto e seguro usando NextAuth.js 5 integrado com **Keycloak** como Identity Provider (IdP) principal. O "Login Cateno" redireciona para o Keycloak via OpenID Connect (OIDC). RBAC híbrido: roles básicas sincronizadas do Keycloak + permissões granulares locais no Prisma. Toda gestão de credenciais (login, password reset, MFA futuro) é delegada ao Keycloak.

## 2. Escopo

### 2.1 Incluído

- Integração NextAuth.js 5 com Next.js 15 App Router
- **Keycloak como IdP** via provider OIDC nativo do NextAuth (`KeycloakProvider`)
- Session management com JWT (NextAuth) + refresh token do Keycloak
- Middleware de proteção de rotas
- Helpers `requireAuth()` e `requireRole()`
- Página de login com design Cateno (fundo teal, card branco, botão único "Entrar com Login Cateno")
- Fluxo de logout com invalidação de sessão local + logout no Keycloak (front-channel)
- Back-channel logout: endpoint para Keycloak notificar invalidação de sessão
- Token refresh automático via refresh_token do Keycloak
- Integração com Prisma (models User, Session, Account)
- Callback de sincronização de usuário e roles após login (Keycloak → Prisma)
- **RBAC híbrido**: roles básicas do Keycloak (admin, user, viewer) sincronizadas + permissões granulares locais (model Permission no Prisma)
- Error handling: sessão expirada, Keycloak indisponível, etc
- AuditLog unificado (modelo único para auditoria de entidades e eventos de auth)
- Variáveis de configuração do Keycloak em `.env.local`

### 2.2 Excluído

- **Auto-cadastro (signup)** — usuários são provisionados via Keycloak ou admin
- **Login por email/password no portal** — toda autenticação por credenciais é gerenciada pelo Keycloak
- **Password reset no portal** — delegado ao Keycloak (páginas `/forgot-password` e `/reset-password` não existem)
- **bcrypt / hash de senhas** — portal não armazena senhas, Keycloak é responsável
- Integração com LDAP/Active Directory (responsabilidade do Keycloak, não do portal)
- Autenticação multifator (MFA/2FA) — configurável no Keycloak, transparente para o portal
- Social login além de "Login Cateno"
- Configuração/administração do Keycloak (já operacional)

## 3. Requisitos Funcionais

| ID        | Descrição                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| RF-002-01 | Usuário deve poder fazer login via "Login Cateno" que redireciona para o Keycloak (OIDC)                                    |
| RF-002-02 | Página de login exibe apenas o botão "Entrar com Login Cateno" (sem formulário email/senha)                                 |
| RF-002-03 | Usuário deve poder fazer logout com invalidação de sessão local + logout no Keycloak (front-channel)                        |
| RF-002-04 | Sessão deve expirar automaticamente após 24 horas de inatividade                                                            |
| RF-002-05 | Token deve ser refresh automaticamente via refresh_token do Keycloak quando access_token próximo de expirar (< 5 min)       |
| RF-002-06 | Rotas /aplicacoes e /catia devem ser protegidas, redirecionando para login se não autenticado                               |
| RF-002-07 | Usuário logado deve ter acesso ao seu avatar/iniciais na navbar (dados do Keycloak)                                         |
| RF-002-08 | Helper `requireAuth()` deve throw error 401 se usuário não autenticado                                                      |
| RF-002-09 | Helper `requireRole(role)` deve validar se usuário tem permissão (RBAC híbrido)                                             |
| RF-002-10 | Usuário novo via Keycloak deve ser sincronizado no Prisma com role "user" por padrão                                        |
| RF-002-11 | Roles do Keycloak (realm_access.roles) devem ser sincronizadas para o banco local a cada login                              |
| RF-002-12 | Atualização automática de dados do usuário (name, email, avatar) após cada login via Keycloak                               |
| RF-002-13 | Logout deve limpar session storage do cliente e redirecionar para o endpoint de logout do Keycloak                          |
| RF-002-14 | Back-channel logout: endpoint `/api/auth/backchannel-logout` para Keycloak notificar invalidação de sessão                  |
| RF-002-15 | Erros de autenticação (Keycloak indisponível, token inválido) devem ser tratados com mensagens claras                       |
| RF-002-16 | Permissões granulares locais (model Permission) devem complementar as roles do Keycloak para controle fino de acesso a apps |

## 4. Requisitos Não-Funcionais

| ID         | Categoria        | Descrição                                                                                       |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| RNF-002-01 | Segurança        | Portal NÃO armazena senhas — toda autenticação por credenciais é delegada ao Keycloak           |
| RNF-002-02 | Segurança        | CSRF tokens devem ser validados em todas as forms                                               |
| RNF-002-03 | Segurança        | Cookie de sessão deve ter flags Secure, HttpOnly, SameSite=Lax                                  |
| RNF-002-04 | Segurança        | Variáveis do Keycloak (KEYCLOAK_ID, KEYCLOAK_SECRET, KEYCLOAK_ISSUER) devem estar em .env.local |
| RNF-002-05 | Segurança        | Tokens do Keycloak (access_token, refresh_token) não devem ser expostos ao cliente              |
| RNF-002-06 | Performance      | Login deve completar em < 2 segundos (incluindo redirect ao Keycloak)                           |
| RNF-002-07 | Performance      | Session lookup deve usar cache (Redis ou memory cache)                                          |
| RNF-002-08 | Acessibilidade   | Página de login deve ter labels, ARIA attributes, teclado navegável                             |
| RNF-002-09 | Acessibilidade   | Mensagens de erro devem ser descritivas e acessíveis                                            |
| RNF-002-10 | Auditoria        | Logins bem-sucedidos devem ser registrados no AuditLog com timestamp, IP e user-agent           |
| RNF-002-11 | Auditoria        | Logouts e falhas de autenticação devem ser registrados                                          |
| RNF-002-12 | Escalabilidade   | Sistema deve suportar 1000+ sessões simultâneas                                                 |
| RNF-002-13 | Manutenibilidade | Código de auth deve estar em `src/lib/auth.ts` e bem testado                                    |
| RNF-002-14 | Resiliência      | Se Keycloak estiver indisponível, exibir página de erro amigável com retry automático           |

## 5. Interface / UX

### Página de Login (`/login`)

**Layout:**

- Fundo com gradiente teal (bg-teal-600 a teal-700)
- Card branco centralizado (w-96, shadow-lg, border-0)
- `<CatenoLogo size="lg" variant="white" />` (versão branca sobre fundo teal)
- Heading "Bem-vindo ao Portal Cateno"
- Subheading em neutral-500 "Acesse suas aplicações"

**Componentes:**

- Botão único grande teal com ícone de login:
  ```
  "Entrar com Login Cateno" → onClick → redireciona para Keycloak OIDC
  ```
- Texto abaixo do botão: "Autenticação segura via Keycloak" (neutral-400, small)

**States:**

- Loading: Botão desabilitado com spinner (durante redirect ao Keycloak)
- Error: Mensagem em red-500 abaixo do botão (ex: "Serviço de autenticação indisponível")
- Keycloak indisponível: Mensagem amigável + botão "Tentar novamente"
- Success: Redirect automático para /aplicacoes (callback do Keycloak)

> **Nota:** Não há formulário de email/senha, páginas de `/forgot-password` ou `/reset-password`. Toda gestão de credenciais é feita no Keycloak.

### Avatar/User Menu no Header

- Avatar circular com iniciais ou imagem do Keycloak (fundo teal-600, texto branco)
- Hover → Dropdown com:
  - Nome do usuário (bold) — sincronizado do Keycloak
  - Email (neutral-500, small)
  - Divider
  - "Meu Perfil" (link)
  - "Configurações" (link)
  - Divider
  - "Logout" (text-red-600) → invalida sessão local + redirect ao logout do Keycloak

## 6. Modelo de Dados

### Extensão do Schema Prisma

```prisma
// Adições a prisma/schema.prisma (SPEC-002 — Keycloak)

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String  // "oidc"
  provider           String  // "keycloak"
  providerAccountId  String  // sub do Keycloak
  access_token       String? @db.Text  // Token de acesso do Keycloak
  refresh_token      String? @db.Text  // Token de refresh do Keycloak
  expires_at         Int?    // Unix timestamp de expiração do access_token
  token_type         String? // "Bearer"
  scope              String? // "openid profile email"
  id_token           String? @db.Text  // ID token do Keycloak

  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id                 String   @id @default(cuid())
  userId             String
  sessionToken       String   @unique  // Token de sessão do NextAuth
  expiresAt          DateTime
  createdAt          DateTime @default(now())

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model VerificationToken {
  identifier         String
  token              String   @unique
  expires            DateTime

  @@unique([identifier, token])
}

// RBAC Híbrido: permissões granulares locais que complementam as roles do Keycloak
model Permission {
  id                 String   @id @default(cuid())
  userId             String
  resource           String   // "application", "admin-panel", etc
  resourceId         String?  // ID específico (ex: ID da aplicação)
  action             String   // "view", "edit", "delete", "access"
  createdAt          DateTime @default(now())

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, resource, resourceId, action])
  @@index([userId])
  @@index([resource, resourceId])
}

// AuditLog UNIFICADO (definido na SPEC-001, estendido aqui com campos de auth)
model AuditLog {
  id                 String   @id @default(cuid())
  entity             String   // "User", "Application", "Auth", etc
  entityId           String?  // ID do registro alterado (null para eventos de auth)
  action             String   // "CREATE", "UPDATE", "DELETE", "login_success", "login_failed", "logout", "backchannel_logout"
  changes            Json?    // Diff (entidades) ou detalhes (auth: provider, keycloakSub, etc)
  userId             String?  // Quem fez a ação (null para login_failed de user inexistente)
  ipAddress          String?  // Eventos de auth
  userAgent          String?  // Eventos de auth
  createdAt          DateTime @default(now())

  user               User?    @relation(fields: [userId], references: [id])

  @@index([entity, entityId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

// User — EXTENSÃO INCREMENTAL da SPEC-001
// Campos base (SPEC-001): id, email, name, avatar, createdAt, updatedAt, deletedAt, roles, favorites, auditLogs
// Campos adicionados (SPEC-002): emailVerified, keycloakSub, accounts, sessions, permissions
// REMOVIDOS vs versão anterior: password, passwordResets (delegados ao Keycloak)
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  emailVerified      Boolean   @default(false)  // ← SPEC-002: confirmado pelo Keycloak
  keycloakSub        String?   @unique          // ← SPEC-002: subject ID do Keycloak
  name               String?
  avatar             String?   // URL do Keycloak ou iniciais
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  deletedAt          DateTime? // Soft delete (SPEC-001)

  accounts           Account[]      // ← SPEC-002
  sessions           Session[]      // ← SPEC-002
  permissions        Permission[]   // ← SPEC-002: RBAC granular local
  roles              Role[]
  favorites          Favorite[]
  auditLogs          AuditLog[]

  @@index([email])
  @@index([keycloakSub])
}
```

### Variáveis de Ambiente (.env.local)

```bash
# Keycloak OIDC
AUTH_KEYCLOAK_ID=portal-cateno           # Client ID no Keycloak
AUTH_KEYCLOAK_SECRET=<secret>            # Client Secret
AUTH_KEYCLOAK_ISSUER=https://keycloak.cateno.com.br/realms/cateno  # Issuer URL

# NextAuth
AUTH_SECRET=<random-secret>              # Secret do NextAuth
NEXTAUTH_URL=http://localhost:3000       # URL base do portal
```

### NextAuth Config

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { prisma } from './db';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      // Solicitar roles no token
      authorization: {
        params: { scope: 'openid profile email roles' },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          keycloakSub: profile.sub,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Primeiro login: salvar tokens do Keycloak
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.id = user.id;

        // Sincronizar roles do Keycloak para o banco local
        const keycloakRoles = (account as any).realm_access?.roles || ['user'];
        const portalRoles = keycloakRoles.filter((r: string) =>
          ['admin', 'user', 'viewer'].includes(r),
        );

        await prisma.user.upsert({
          where: { email: user.email! },
          update: {
            name: user.name,
            avatar: user.image,
            emailVerified: true,
            keycloakSub: (user as any).keycloakSub,
          },
          create: {
            email: user.email!,
            name: user.name,
            avatar: user.image,
            emailVerified: true,
            keycloakSub: (user as any).keycloakSub,
            roles: {
              create: portalRoles.map((name: string) => ({ name })),
            },
          },
        });
      }

      // Refresh token se access_token expirado
      if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number) - 300) {
        // TODO: implementar refresh via Keycloak token endpoint
        // POST {issuer}/protocol/openid-connect/token
        // grant_type=refresh_token&refresh_token=...
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { roles: true, permissions: true },
        });
        session.user.roles = dbUser?.roles.map((r) => r.name) || [];
        session.user.permissions = dbUser?.permissions || [];
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      // AuditLog: login bem-sucedido
      await prisma.auditLog.create({
        data: {
          entity: 'Auth',
          action: 'login_success',
          userId: user.id,
          changes: { provider: 'keycloak', keycloakSub: account?.providerAccountId },
        },
      });
    },
    async signOut({ token }) {
      // AuditLog: logout
      await prisma.auditLog.create({
        data: {
          entity: 'Auth',
          action: 'logout',
          userId: token?.id as string,
        },
      });
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
```

### Back-channel Logout Endpoint

```typescript
// src/app/api/auth/backchannel-logout/route.ts
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  // Keycloak envia logout_token (JWT) com o sub do usuário
  const body = await request.formData();
  const logoutToken = body.get('logout_token') as string;

  // TODO: validar JWT do logout_token com chave pública do Keycloak
  // Extrair sub do token e invalidar sessões locais

  // await prisma.session.deleteMany({ where: { userId: ... } })
  // await prisma.auditLog.create({ ... action: "backchannel_logout" })

  return new Response(null, { status: 200 });
}
```

## 7. Cenários de Teste

| ID        | Cenário                          | Entrada                                                | Resultado Esperado                                                         |
| --------- | -------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| CT-002-01 | Login Keycloak sucesso           | Clica "Entrar com Login Cateno", autentica no Keycloak | Usuário redirecionado para /aplicacoes, sessão criada, AuditLog registrado |
| CT-002-02 | Login Keycloak novo usuário      | Novo usuário faz login pela primeira vez               | User criado no Prisma com role "user", dados do Keycloak sincronizados     |
| CT-002-03 | Login Keycloak usuário existente | Usuário existente faz login                            | Dados atualizados (name, avatar), roles sincronizadas                      |
| CT-002-04 | Logout completo                  | Usuário clica "Logout" no menu                         | Sessão local invalidada + redirect ao logout do Keycloak + AuditLog        |
| CT-002-05 | Acesso rota protegida sem auth   | GET /aplicacoes sem sessão                             | Redirect para /login                                                       |
| CT-002-06 | Token expirado com refresh       | access_token expira, refresh_token válido              | Token refresh automático via Keycloak, sessão mantida                      |
| CT-002-07 | Token expirado sem refresh       | access_token e refresh_token expirados                 | Redirect para /login                                                       |
| CT-002-08 | Rota require admin com role user | requireRole("admin") para user com role "user"         | Throw error 403 Forbidden                                                  |
| CT-002-09 | RBAC híbrido com permission      | User com role "viewer" + permission de app específica  | Acesso permitido apenas à app com permission                               |
| CT-002-10 | Back-channel logout              | Keycloak envia POST /api/auth/backchannel-logout       | Sessão local invalidada, AuditLog registrado                               |
| CT-002-11 | Keycloak indisponível            | Clica login, Keycloak offline                          | Mensagem de erro amigável + botão retry                                    |
| CT-002-12 | CSRF protection                  | POST /api/auth/signout sem CSRF token válido           | Request rejeitado com 403                                                  |
| CT-002-13 | Sincronização de roles           | Admin adiciona role no Keycloak, user faz login        | Role sincronizada para banco local                                         |

## 8. Critérios de Aceite

- [ ] NextAuth.js 5 integrado com PrismaAdapter e KeycloakProvider
- [ ] Login via Keycloak OIDC funcionando (configurável via .env.local)
- [ ] Página de login com design Cateno (teal, card branco, botão único "Entrar com Login Cateno")
- [ ] **Sem** formulário email/senha, **sem** páginas forgot-password/reset-password
- [ ] Session expiração automática após 24h
- [ ] Token refresh automático via refresh_token do Keycloak
- [ ] Middleware de proteção de rotas em `/auth.ts`
- [ ] Helpers `requireAuth()` e `requireRole(role)` exportados de `src/lib/auth.ts`
- [ ] Avatar com dados do Keycloak no header, dropdown menu com logout
- [ ] Logout invalida sessão local E redireciona para logout do Keycloak
- [ ] Back-channel logout endpoint funcional em `/api/auth/backchannel-logout`
- [ ] RBAC híbrido: roles do Keycloak sincronizadas + model Permission para granularidade
- [ ] AuditLog registra logins, logouts e back-channel logouts
- [ ] Keycloak indisponível: página de erro amigável com retry
- [ ] CSRF tokens validados em forms de POST
- [ ] Cookies com flags Secure, HttpOnly, SameSite=Lax
- [ ] Tokens do Keycloak (access_token, refresh_token) não expostos ao cliente
- [ ] keycloakSub armazenado no User para correlação de identidade
- [ ] Todos os 13 cenários de teste CT-002-01 até CT-002-13 passam
- [ ] Testes unitários em `__tests__/lib/auth.test.ts` cobrindo 80%+ do código

## 9. Dependências

- **Depende de:** PC-SPEC-001 (Setup básico do projeto)
- **Bloqueante para:** PC-SPEC-003 (Layout/Navegação — requer usuário logado na navbar)

## 10. Artefatos

| Artefato    | Status   | Link |
| ----------- | -------- | ---- |
| Task        | Pendente | —    |
| Plan        | Pendente | —    |
| Walkthrough | Pendente | —    |
| Testes      | Pendente | —    |

---

[← Voltar ao Backlog](../../)
