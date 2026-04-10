# PC-023 — Upload local de imagens (Salas e Escritórios)

## Resumo

Adicionar suporte a upload de arquivos de imagem nos formulários de Salas de Reunião
(foto da sala) e Escritórios (planta baixa), como alternativa ao campo de URL externa
já existente. Imagens enviadas via upload são armazenadas localmente no servidor do portal.

## Motivação

Atualmente os formulários de criação/edição de salas e escritórios aceitam apenas uma
URL externa (`https://...`) para a imagem. Isso exige que o usuário hospede a imagem em
outro serviço antes de cadastrar. O upload direto simplifica o fluxo de trabalho.

## Escopo

### Incluído
- API route genérica de upload (`POST /api/upload/[category]`) com validação de tipo e tamanho
- API route de servir imagens (`GET /api/upload/[category]/[filename]`)
- Toggle URL / Upload nos formulários de Sala e Escritório
- Preview da imagem selecionada antes de salvar
- Armazenamento local em `./uploads/{category}/` com nomes UUID

### Excluído
- Migração de imagens existentes (URLs externas continuam funcionando)
- Redimensionamento ou compressão de imagens no servidor
- Autenticação no endpoint de upload (mesmo nível de acesso dos formulários)

## Especificação Técnica

### API de Upload

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/upload/[category]` | POST | Recebe FormData com campo `file`, salva em `./uploads/{category}/` |
| `/api/upload/[category]/[filename]` | GET | Serve arquivo estático com cache imutável |

**Categorias permitidas:** `salas`, `escritorios`

**Validações:**
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: 5 MB
- Nome do arquivo salvo: UUID v4 + extensão original
- Proteção contra path traversal no endpoint de servir

**Resposta do POST:**
```json
{ "url": "/api/upload/salas/a1b2c3d4-...-e5f6.jpg" }
```

### Fluxo do frontend

1. Usuário escolhe entre "URL" e "Upload" via toggle no formulário
2. Modo URL: campo de texto como antes (validação `https://`)
3. Modo Upload: botão de seleção de arquivo com preview + botão remover
4. Ao salvar com upload: arquivo é enviado para `/api/upload/{category}`, URL retornada
   é enviada como `foto_url` / `planta_baixa_url` ao ms-reservas
5. Contrato do ms-reservas permanece inalterado (sempre recebe uma URL string)

## Critérios de Aceite

- [ ] Toggle URL/Upload funciona no formulário de Salas
- [ ] Toggle URL/Upload funciona no formulário de Escritórios
- [ ] Upload aceita apenas JPEG, PNG e WebP
- [ ] Upload rejeita arquivos acima de 5 MB com mensagem de erro
- [ ] Preview da imagem aparece após seleção do arquivo
- [ ] Imagem é salva em `./uploads/{category}/` com nome UUID
- [ ] Imagem salva é acessível via GET `/api/upload/{category}/{filename}`
- [ ] URL retornada pelo upload é persistida corretamente no ms-reservas
- [ ] URLs externas existentes continuam funcionando normalmente
- [ ] Diretório `/uploads` está no `.gitignore`

## Arquivos Alterados

| Arquivo | Tipo |
|---|---|
| `src/app/api/upload/[category]/route.ts` | Novo |
| `src/app/api/upload/[category]/[filename]/route.ts` | Novo |
| `src/app/(app)/reservas/_lib/sala.api.ts` | Modificado |
| `src/app/(app)/reservas/_lib/escritorio.api.ts` | Modificado |
| `src/app/(app)/reservas/_components/salas/salas-page-client.tsx` | Modificado |
| `src/app/(app)/reservas/_components/escritorios/escritorios-page-client.tsx` | Modificado |
| `.gitignore` | Modificado |
