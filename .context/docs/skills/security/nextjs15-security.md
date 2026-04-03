---
name: nextjs15-security
description: 'Security best practices specific to Next.js 15 App Router, covering Server Components, Server Actions, middleware, CSP, CSRF protection, and secure data handling patterns.'
risk: unknown
source: internal
date_added: '2026-04-03'
---

# Next.js 15 App Router Security

## Purpose

Provide security guidelines specific to Next.js 15 App Router architecture, covering patterns that are unique to this framework and not addressed by generic web security skills. Focus on Server Components, Server Actions, Route Handlers, Middleware, and the boundary between server and client code.

## When to Use This Skill

- Implementing Server Actions with form handling
- Configuring middleware for authentication and route protection
- Setting up Content Security Policy (CSP) headers
- Handling sensitive data in Server vs Client Components
- Implementing CSRF protection in Server Actions
- Securing API Route Handlers
- Managing environment variables and secrets
- Configuring security headers in `next.config.ts`

## Core Security Principles for Next.js 15

### 1. Server/Client Boundary Security

The most critical security concept in Next.js App Router is the **server/client boundary**. Server Components run exclusively on the server and never expose their code to the client.

**Rules:**

- NEVER pass sensitive data (secrets, tokens, database results with sensitive fields) as props from Server Components to Client Components
- Use `"use server"` directive only in files/functions that should be callable from the client
- Use `"use client"` sparingly — every Client Component increases the attack surface
- NEVER import server-only modules (like `prisma`, `bcryptjs`, database utilities) in Client Components
- Use the `server-only` package to prevent accidental client-side imports:

```typescript
// src/lib/db.ts
import 'server-only';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

### 2. Server Actions Security

Server Actions are the primary mutation mechanism in Next.js 15. They are essentially **public HTTP endpoints** — treat them as such.

**Rules:**

- ALWAYS validate input with Zod in every Server Action
- ALWAYS check authentication and authorization at the start of every Server Action
- NEVER trust the client — re-validate everything server-side
- Use `revalidatePath()` or `revalidateTag()` instead of returning sensitive data
- Implement rate limiting for sensitive actions (login, password reset)
- NEVER expose internal error details — return generic messages

```typescript
// src/app/(app)/aplicacoes/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const toggleFavoriteSchema = z.object({
  applicationId: z.string().cuid(),
});

export async function toggleFavorite(formData: FormData) {
  // 1. Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado');
  }

  // 2. Input validation
  const parsed = toggleFavoriteSchema.safeParse({
    applicationId: formData.get('applicationId'),
  });
  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  // 3. Authorization check (user can only modify own favorites)
  const { applicationId } = parsed.data;

  // 4. Business logic
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_applicationId: {
        userId: session.user.id,
        applicationId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: { userId: session.user.id, applicationId },
    });
  }

  revalidatePath('/aplicacoes');
}
```

### 3. Middleware Security

Next.js middleware runs on the Edge Runtime before every request. Use it as the first line of defense.

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/aplicacoes', '/catia', '/perfil', '/admin'];
// Routes that require admin role
const adminRoutes = ['/admin'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect authenticated routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const roles = req.auth?.user?.roles || [];
    if (!roles.includes('admin')) {
      return NextResponse.redirect(new URL('/aplicacoes', req.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
```

### 4. Content Security Policy (CSP)

Configure CSP via `next.config.ts` and/or middleware with nonce-based approach:

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{NONCE}'", // Nonce generated per request
      "style-src 'self' 'unsafe-inline'", // Tailwind needs inline styles
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

For dynamic nonce-based CSP (recommended for production):

```typescript
// src/middleware.ts — add nonce generation
import { randomBytes } from 'crypto';

// In middleware function:
const nonce = randomBytes(16).toString('base64');
const cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`;

response.headers.set('Content-Security-Policy', cspHeader);
response.headers.set('x-nonce', nonce); // Pass nonce to Server Components
```

### 5. CSRF Protection in Server Actions

Next.js 15 Server Actions have built-in CSRF protection via the `Origin` header check. However, additional measures are recommended:

**Rules:**

- Server Actions automatically check `Origin` header — DO NOT disable this
- For extra protection, implement double-submit cookie pattern for critical actions
- Always use `POST` method (Server Actions do this by default)
- Validate `Referer` header for sensitive operations

### 6. Route Handlers (API Routes) Security

```typescript
// src/app/api/applications/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: Request) {
  // 1. Authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Rate limiting check (use the in-memory Map pattern)
  // ...

  // 3. Input validation for query params
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // 4. Never return more data than needed
  const applications = await prisma.application.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      category: true,
      url: true,
      // DO NOT select internal fields
    },
    where: category ? { category } : undefined,
  });

  return NextResponse.json(applications);
}
```

### 7. Environment Variables Security

**Rules:**

- NEVER prefix secrets with `NEXT_PUBLIC_` — this exposes them to the client bundle
- Use `.env.local` for secrets (never committed to git)
- Validate all required env vars at startup:

```typescript
// src/lib/env.ts
import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_CATENO_ID: z.string().min(1),
  AUTH_CATENO_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

### 8. Data Fetching Security

**Server Components (safe by default):**

```typescript
// This runs ONLY on the server — database access is safe here
export default async function ApplicationsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const applications = await prisma.application.findMany({
    select: { id: true, name: true, description: true, icon: true, url: true },
  })

  // SAFE: only serializable data reaches the client
  return <ApplicationGrid applications={applications} />
}
```

**Client Components (must fetch via API or Server Actions):**

```typescript
"use client"

// NEVER import prisma or server-only modules here
// Use Server Actions or fetch() to API routes
import { toggleFavorite } from "./actions"

export function FavoriteButton({ applicationId }: { applicationId: string }) {
  return (
    <form action={toggleFavorite}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <button type="submit">Favoritar</button>
    </form>
  )
}
```

### 9. Error Handling Security

**Rules:**

- NEVER expose stack traces or internal error details to the client
- Use `error.tsx` boundary files to catch and sanitize errors
- Log detailed errors server-side, return generic messages client-side

```typescript
// src/app/(app)/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // NEVER show error.message to the user in production
  // The digest can be used to correlate with server logs
  return (
    <div>
      <h2>Algo deu errado</h2>
      <p>Ocorreu um erro inesperado. Tente novamente.</p>
      {error.digest && (
        <p className="text-xs text-neutral-400">Código: {error.digest}</p>
      )}
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```

### 10. Dependency Security

- Run `npm audit` regularly and before each deploy
- Use `npm audit --production` to focus on production dependencies
- Pin exact versions in `package.json` for security-critical packages
- Review dependency changes in PRs (check for supply chain attacks)
- Consider using `npm audit signatures` for package integrity

## Security Checklist for Portal Cateno

### Per Server Action:

- [ ] Authentication check (`await auth()`)
- [ ] Authorization check (role validation if needed)
- [ ] Zod input validation
- [ ] Generic error messages (no internal details)
- [ ] Rate limiting for sensitive actions
- [ ] AuditLog entry for important mutations

### Per Route Handler:

- [ ] Authentication check
- [ ] Input validation (query params, body)
- [ ] Minimal data selection (no over-fetching)
- [ ] Proper HTTP status codes
- [ ] Rate limiting

### Per Page/Layout:

- [ ] Server Component by default (minimize `"use client"`)
- [ ] No sensitive data passed as props to Client Components
- [ ] `error.tsx` boundary with sanitized messages
- [ ] `loading.tsx` for good UX during auth checks

### Configuration:

- [ ] Security headers in middleware
- [ ] CSP configured
- [ ] `server-only` package used in sensitive modules
- [ ] Environment variables validated at startup
- [ ] `.env.local` in `.gitignore`
