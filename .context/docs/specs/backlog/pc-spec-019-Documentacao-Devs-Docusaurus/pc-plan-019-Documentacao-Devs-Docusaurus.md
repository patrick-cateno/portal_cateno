# PC-PLAN-019 — Documentação para Desenvolvedores (Docusaurus)

**Status:** Backlog
**Agente:** documentation-writer + frontend-specialist
**Prioridade:** Alta — devs precisam disso para integrar microsserviços
**Repositório:** portal-cateno-docs (separado)
**Referência visual:** https://ionicframework.com/docs

## Critérios de aceite

- [ ] Repositório portal-cateno-docs criado
- [ ] Docusaurus 3 com tema Cateno (teal-600)
- [ ] Página inicial com 4 cards de quick access
- [ ] Todas as seções escritas e publicadas
- [ ] Referência da API gerada do service-registry-openapi.yaml
- [ ] Exemplos em curl + TypeScript para todos os endpoints
- [ ] Busca Algolia configurada
- [ ] Deploy via GitHub Actions
- [ ] Quickstart funciona em 5 minutos

## Tarefas

| # | Tarefa | Estimativa |
|---|--------|-----------|
| 1 | Criar repositório portal-cateno-docs | 30min |
| 2 | Inicializar Docusaurus 3 + configurar tema Cateno | 2h |
| 3 | Página inicial com cards (estilo Ionic docs) | 2h |
| 4 | Escrever Getting Started (overview + quickstart + concepts) | 3h |
| 5 | Escrever Integrando (registro + health + tool registry) | 4h |
| 6 | Configurar docusaurus-plugin-openapi-docs com service-registry-openapi.yaml | 2h |
| 7 | Escrever seção CatIA (how it works + writing tools + testing) | 3h |
| 8 | Escrever Guias Avançados (RBAC + tipos integração + troubleshooting) | 3h |
| 9 | Adicionar exemplos curl + TypeScript em todos os endpoints | 3h |
| 10 | Configurar Algolia DocSearch | 1h |
| 11 | GitHub Actions para deploy automático | 1h |
| 12 | Revisão final e teste do quickstart | 2h |
| **Total** | | **~26.5h** |

## Ordem de prioridade do conteúdo

Escrever nesta ordem — as mais críticas primeiro:
1. Quickstart (5 min para registrar o primeiro microsserviço)
2. Tool Registry (integração com CatIA — diferencial do portal)
3. Health Check (necessário para status em tempo real)
4. Referência da API (gerada automaticamente do OpenAPI)
5. Demais seções

## Artefatos de saída

- Repositório `portal-cateno-docs/` com Docusaurus configurado
- Site publicado em docs.cateno.com.br
- `.github/workflows/deploy-docs.yml`
