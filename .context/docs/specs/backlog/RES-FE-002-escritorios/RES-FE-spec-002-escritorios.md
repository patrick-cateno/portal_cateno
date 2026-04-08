# RES-FE-SPEC-002 — Gestão de Escritórios (Admin)

> Status: Aguardando aprovação
> Role exigida: `reservas:admin` ou `admin`
> Rota: `/reservas/admin/escritorios`
> Depende de: RES-FE-001

---

## 1. Objetivo

Tela de administração para listar, criar, editar e desativar escritórios.
Cada escritório é a unidade física que agrupa salas e estações de trabalho.

---

## 2. Endpoints utilizados (ms-reservas)

| Método | Endpoint                  | Uso                        |
|--------|---------------------------|----------------------------|
| GET    | `/v1/escritorios`         | Listar com paginação       |
| POST   | `/v1/escritorios`         | Criar novo                 |
| PATCH  | `/v1/escritorios/:id`     | Editar                     |
| DELETE | `/v1/escritorios/:id`     | Desativar (soft delete)    |

**Query params disponíveis:** `page`, `limit`, `cidade`, `is_active` (default: true)

**Body de criação:**
```json
{
  "nome": "Sede Rio de Janeiro",
  "cidade": "Rio de Janeiro",
  "planta_baixa_url": "https://storage.cateno.com.br/plantas/rj.png"
}
```

---

## 3. Layout da Tela

### 3.1 Page Header
```
[Título: "Escritórios"]          [Botão: "+ Novo Escritório"]
```
- Título: `font-size: 30px`, `font-weight: 700`, `color: #0F172A`
- Botão primário: `background: #0D9488`, `color: #FFF`, `border-radius: 8px`

### 3.2 Filtros
```
[Input: Buscar por nome/cidade]   [Select: Cidade]   [Toggle: Mostrar inativos]
```

### 3.3 Tabela de listagem

Colunas:
| Nome | Cidade | Salas | Estações | Status | Ações |
|------|--------|-------|----------|--------|-------|

- **Status**: Badge verde "Ativo" / cinza "Inativo"
- **Ações**: ícone de editar (lápis) + ícone de desativar (X)
- Linha hover: `background: #F1F5F9`
- Paginação no rodapé: "Mostrando X–Y de Z registros" + controles

### 3.4 Modal: Criar / Editar Escritório

Campos:
- **Nome** (obrigatório, max 100) — `text input`
- **Cidade** (obrigatório, max 100) — `text input`
- **URL da Planta Baixa** (opcional) — `text input` com placeholder "https://..."

Ações do modal:
- [Cancelar] — ghost button
- [Salvar] — botão primário teal

### 3.5 Confirmação de desativação

AlertDialog (componente existente no Portal) com:
- Título: "Desativar escritório?"
- Descrição: "Salas e estações deste escritório não ficarão disponíveis para reservas."
- Botões: [Cancelar] e [Desativar]

---

## 4. Regras de Negócio (frontend)

**RN-FE-002-001** — O botão "+ Novo Escritório" e ações de editar/desativar são visíveis apenas para `reservas:admin` / `admin`.

**RN-FE-002-002** — URL da planta baixa, quando informada, deve começar com `https://`. Validação no cliente antes de submeter.

**RN-FE-002-003** — Ao desativar um escritório, exibir AlertDialog de confirmação antes de chamar `DELETE /v1/escritorios/:id`.

**RN-FE-002-004** — Escritórios inativos são exibidos com badge cinza e linha com `opacity: 0.6`. Por padrão, o toggle "Mostrar inativos" está desligado.

**RN-FE-002-005** — Após criar ou editar com sucesso, fechar o modal e recarregar a lista.

---

## 5. Estados de UI

| Estado             | Comportamento                                              |
|--------------------|------------------------------------------------------------|
| Carregando lista   | Skeleton de 5 linhas na tabela                             |
| Lista vazia        | Ilustração + "Nenhum escritório cadastrado" + botão criar  |
| Erro de rede       | Toast de erro "Falha ao carregar escritórios"              |
| Salvando           | Botão "Salvar" com spinner e desabilitado                  |
| Sucesso ao criar   | Toast "Escritório criado com sucesso" + fechar modal       |
| Sucesso ao editar  | Toast "Escritório atualizado" + fechar modal               |
| Sucesso ao desativar| Toast "Escritório desativado"                             |

---

## 6. Critérios de Aceite

**CA-001**
- Dado que sou admin e acesso `/reservas/admin/escritorios`
- Quando a página carrega
- Então vejo a lista paginada de escritórios ativos com colunas: Nome, Cidade, Status, Ações

**CA-002**
- Dado que clico em "+ Novo Escritório"
- Quando preencho Nome e Cidade e clico em "Salvar"
- Então `POST /v1/escritorios` é chamado e o escritório aparece na lista

**CA-003**
- Dado que clico em editar um escritório
- Quando altero o nome e clico em "Salvar"
- Então `PATCH /v1/escritorios/:id` é chamado com o novo nome

**CA-004**
- Dado que clico em desativar um escritório
- Quando o AlertDialog é exibido e clico em "Desativar"
- Então `DELETE /v1/escritorios/:id` é chamado e o escritório desaparece da lista (pois `is_active=true` por padrão)

**CA-005**
- Dado que ativo o toggle "Mostrar inativos"
- Quando a lista recarrega
- Então escritórios inativos aparecem com badge cinza e `opacity: 0.6`

**CA-006**
- Dado que submeto o formulário com URL de planta baixa sem `https://`
- Quando valido no cliente
- Então um erro inline "URL deve começar com https://" é exibido sem chamar a API
