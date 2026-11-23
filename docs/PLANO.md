# Trabalho #3 — Plano (apresentação: qui 26/11/2026)

Tema: **Sistema de Controle de Ordens de Serviço — Oficina de Conserto de Celulares**
Stack: Node + Express + Prisma + PostgreSQL (Neon) + Zod | React + Vite + TypeScript
IA principal: Claude (Anthropic). Opcional: 2ª IA (ex.: ChatGPT ou Copilot) para comparar 1–2 tarefas.

## Requisitos do enunciado → onde são cumpridos
| Requisito | Entrega |
|---|---|
| Usar 1 ou 2 IAs | Claude (+ opcional 2ª IA no comparativo) |
| Mostrar prompts usados | `docs/PROMPTS.md` → slides |
| Mostrar resultados obtidos | prints da app + trechos de código |
| Back-end e Front-end com tecnologias do curso | `backend/` e `frontend/` |
| Analisar o código | `docs/ANALISE.md` (bom / ruim / corrigido à mão) |
| Testar e indicar o que funcionou e problemas | `docs/TESTES.md` (tabela de casos) |
| Apresentação | slides (10–12) |

## Etapas
### Seg 23/11 — Base (≈2h)
1. [x] Esquema do banco (`schema.prisma`) e esqueleto back/front
2. [x] Criar banco no Neon, preencher `backend/.env`, rodar `npm install` e `npx prisma migrate dev --name init` (20 min)
3. [x] Testar `GET/POST /clientes` (Insomnia/Thunder Client) e tela de Clientes (15 min)

### Ter 24/11 — Back-end completo (≈3h)
4. [x] Rotas CRUD: `/aparelhos`, `/servicos` (1h)
5. [x] `/ordens`: criar OS, adicionar itens, recalcular `valorTotal` (transação), alterar status (1h)
6. [x] `/usuarios` + `/login` (bcrypt + JWT) e middleware protegendo rotas (45 min)
7. [x] `/dashboard`: OS por status, faturamento do mês (15 min)

### Qua 25/11 — Front-end (≈3–4h)
8. [x] Login + guardar token (45 min)
9. [x] Telas: Aparelhos, Serviços (1h)
10. [x] Ordens: lista com filtro por status, nova OS, detalhe com itens e troca de status (1h30)
11. [x] Dashboard simples (30 min)

### Qua 25/11 noite — Testes e análise (≈1h30)
12. [x] Preencher `TESTES.md` (casos válidos, inválidos, bugs encontrados)
13. [x] Preencher `ANALISE.md` (qualidade do código gerado, correções manuais)

### Qui 26/11 manhã — Apresentação (≈1h30)
14. [x] Slides: problema → IAs → prompts → resultados → código → testes → conclusões
15. [ ] Ensaiar demo (5 min) com dados de exemplo (seed)

## Regras de negócio da OS
- Fluxo: ABERTA → EM_ANALISE → AGUARDANDO_APROVACAO → EM_CONSERTO → PRONTA → ENTREGUE (CANCELADA a qualquer momento antes de ENTREGUE)
- `valorTotal` = soma de `quantidade × preco` dos itens (preço copiado do serviço no momento da inclusão)
- Ao marcar ENTREGUE, grava `dataEntrega`
- Aparelho precisa pertencer ao cliente da OS
