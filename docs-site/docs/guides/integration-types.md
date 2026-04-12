---
sidebar_position: 1
title: Tipos de Integração
---

# Tipos de Integração em Detalhe

O portal suporta 3 tipos de integração. A escolha depende de se seu microsserviço tem frontend próprio.

## redirect — App standalone

**Quando usar:** seu microsserviço tem um frontend completo e independente.

O portal mostra o card no catálogo. Ao clicar, redireciona o browser para a URL do seu app:

```
window.location.href = frontend_url
```

**Exemplo:** Módulo de Reservas com interface React própria.

**Campos obrigatórios:**

- `integration_type: "redirect"`
- `frontend_url`: URL do seu frontend

---

## embed — Micro-frontend / iframe

**Quando usar:** seu app pode funcionar embutido dentro do portal.

O portal renderiza seu app dentro de um iframe:

```html
<iframe src="{frontend_url}" style="width: 100%; height: 100%; border: none;" />
```

**Exemplo:** Dashboard de métricas que faz sentido dentro do contexto do portal.

**Campos obrigatórios:**

- `integration_type: "embed"`
- `frontend_url`: URL do seu frontend (deve suportar iframe)

:::warning Considerações

- Seu app deve funcionar dentro de um iframe (verifique `X-Frame-Options`)
- Comunicação portal ↔ iframe via `postMessage` se necessário
- O JWT é propagado via URL params ou postMessage
  :::

---

## modal — Dados inline no portal

**Quando usar:** seu microsserviço é 100% backend, sem frontend próprio.

O portal chama a API do seu serviço e renderiza os dados inline, tipicamente em um modal ou painel:

```
fetch(api_base_url + endpoint) → renderizar dados no portal
```

**Exemplo:** Consulta de saldo que retorna JSON e o portal formata.

**Campos obrigatórios:**

- `integration_type: "modal"`
- `api_base_url`: URL base da sua API

---

## Resumo

|                       |      redirect      |    embed     |     modal     |
| --------------------- | :----------------: | :----------: | :-----------: |
| Frontend próprio      |        sim         |     sim      |    **não**    |
| Roda dentro do portal |        não         | sim (iframe) | sim (inline)  |
| `frontend_url`        |    obrigatório     | obrigatório  |   opcional    |
| `api_base_url`        |      opcional      |   opcional   |  obrigatório  |
| UX                    | Navegação completa |   Embutido   | Dados simples |
