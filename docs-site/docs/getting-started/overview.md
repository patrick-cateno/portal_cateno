---
sidebar_position: 1
title: Visão Geral
---

# O que é o Portal Cateno

O **Portal Cateno** é a aplicação frontend centralizada que unifica todas as aplicações e microsserviços da Cateno. Oferece duas experiências de navegação:

- **Visão Cards** — Grid de aplicações com busca, filtros, favoritos e categorias
- **CatIA** — Interface conversacional com IA para navegação e execução de ações por linguagem natural

## Arquitetura

```
Browser
  ↓
Portal Shell (Next.js 15) — autentica via Keycloak OAuth2 PKCE
  ↓ JWT Bearer
API Gateway (Kong) — valida JWT (JWKS) e roteia
  ↓ JWT propagado
Microsserviço — 100% backend, sem HTML/CSS/JS
  ↓
PostgreSQL (schema dedicado: {sigla}.*)
```

O portal **não contém lógica de negócio**. Toda regra de negócio vive nos microsserviços. O portal sabe apenas:

- **Quais** aplicações existem (via Service Registry API)
- **Quem** pode acessar cada uma (roles extraídos do JWT — decidido no servidor)
- **Como** abrir cada uma (redirect / embed / modal)

## Como funciona a integração

Para seu microsserviço aparecer no portal, você precisa:

1. **Registrar** o microsserviço no Service Registry
2. **Implementar** o endpoint `GET /health` para monitoramento
3. **(Opcional)** Registrar tools para o CatIA poder interagir com seu serviço

O [Quickstart](./quickstart) te guia pelos 3 passos em 5 minutos.

## Tipos de integração

| Tipo       | Quando usar                         | Como funciona                                        |
| ---------- | ----------------------------------- | ---------------------------------------------------- |
| `redirect` | App com frontend standalone         | Portal redireciona para `frontend_url`               |
| `embed`    | App embutível via iframe            | Portal renderiza `<iframe src={frontend_url} />`     |
| `modal`    | Backend only — sem frontend próprio | Portal chama `api_base_url` e renderiza dados inline |

## Conceitos fundamentais

| Conceito             | Descrição                                                  |
| -------------------- | ---------------------------------------------------------- |
| **Service Registry** | API central que mantém o catálogo de microsserviços        |
| **Health Check**     | Endpoint que o portal consulta a cada 30s para status      |
| **Tool**             | Ação que o CatIA pode executar no seu microsserviço        |
| **Slug**             | Identificador permanente do app (nunca muda após registro) |
| **JWT**              | Token do usuário propagado do gateway para o microsserviço |
