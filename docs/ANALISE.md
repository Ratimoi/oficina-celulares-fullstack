# Análise do código gerado pela IA

## Pontos positivos
- Regra de negócio do status concentrada num único mapa (`proximos`)
- Validação com Zod em todas as entradas da API
- Total da OS recalculado dentro de transação
## Problemas encontrados
- Erros do Prisma devolvidos crus em algumas rotas (`String(error)`)
- Mapa de status duplicado no front e no back
## Correções feitas à mão
- Nenhuma no código: todas as correções abaixo foram feitas pela IA a partir dos erros colados no chat

### Erro 1 — P1001 no `prisma migrate` (23/11)
- Causa: a IA gerou o `.env` só com a URL do *pooler* do Neon; o `migrate` precisa de conexão direta.
- Correção: `directUrl = env("DIRECT_URL")` no `schema.prisma` + URL sem `-pooler` no `.env`.
- Efeito colateral: como o migrate falhou, o Prisma Client não foi gerado → `StatusOS` não existia no `@prisma/client`.

### Erro 2 — rede da faculdade bloqueia porta 5432
- `Test-NetConnection` sugerido pela IA; resolvido usando 4G. Risco para a demo.

### Erro 3 — `.env` com placeholder
- Erro humano ao copiar o exemplo; IA detectou comparando as credenciais das duas URLs (sem exibir a senha).

### Erro 4 — coleção do Insomnia com referências quebradas
- Causa: IDs gerados pela IA eram prefixo uns dos outros (`req_os` / `req_os_get`); o Insomnia remapeia IDs por texto no import e corrompeu as *response tags*.
- Correção: IDs únicos aleatórios (estilo do próprio Insomnia).

### Bug 5 — fuso horário na previsão (encontrado no teste T8)
- Data sem hora é salva como meia-noite UTC; exibida no fuso de Brasília vira o dia anterior.
- Correção: formatar com `timeZone: "UTC"` no front.

### Bug 6 — IDs inválidos e erros assíncronos (revisão + T9)
- Rotas faziam `Number(req.params.id)` sem validar; `NaN` ia para o Prisma. Express 4 não captura erro de rota `async`.
- Correção: `router.param("id", validaId)` em todas as rotas + middleware de erro global + log de `unhandledRejection`.
