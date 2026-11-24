# Registro de prompts (para a apresentação)

**Conversa completa com a IA (Claude):** https://claude.ai/share/5433ee90-e994-4e66-b69b-5590d1acdb32

Formato: data · IA · prompt · o que gerou · funcionou? · ajustes feitos

## 1 — 23/11 · Claude
**Prompt:** "Quero que você analise esse projeto e comece o esquema inicial. Depois, elabore um plano para cumprir todos os requerimentos do trabalho." (+ PDF do enunciado anexado)
**Resultado:** escolha do tema (oficina de celulares), `schema.prisma` com 6 models + enum de status, esqueleto Express com CRUD de clientes, esqueleto React/Vite com tela de clientes, este plano.
**Funcionou?** _(preencher após rodar)_
**Ajustes manuais:** _(preencher)_

## 2 — 23/11 · Claude
**Prompt:** "Próximo passo"
**Resultado:** back-end completo: rotas de aparelhos, serviços (exclusão lógica), ordens (fluxo de status validado, itens com recálculo do total em transação, diagnóstico), usuários/login (bcrypt + JWT 8h), dashboard, middleware `verificaToken`.
**Funcionou?** _(preencher após testar)_
**Ajustes manuais:** _(preencher)_

## 3 — 23/11 · Claude (depuração)
**Prompts:** colei 3 vezes a saída de erro do terminal (P1001 → P1001 → P1000).
**Resultado:** IA identificou: (1) migrate precisa de `directUrl` sem pooler; (2) rede da faculdade bloqueia porta 5432; (3) `DIRECT_URL` ficou com placeholder `USER:SENHA`.
**Funcionou?** Sim, migrate rodou após as correções.

## 4 — 23/11 · Claude
**Prompt:** "Rodou corretamente"
**Resultado:** front-end completo: login/cadastro (token no localStorage), dashboard, CRUD de clientes/aparelhos/serviços, lista de OS com filtro por status, nova OS (aparelhos filtrados pelo cliente), detalhe da OS com itens, diagnóstico e botões de status.
**Funcionou?** _(preencher)_

## 5 — 23/11 · Claude
**Prompt:** "Fiz os cadastros e tudo funcionou corretamente"
**Resultado:** roteiro de 10 casos de teste em `TESTES.md`, com 2 suspeitas de bug apontadas pela própria IA na revisão do código (fuso horário da previsão; erro async derrubando o Express).

## 6 — 23/11 · Claude
**Prompt:** "Pode realizar a sugestão utilizando o Insomnia"
**Resultado:** coleção `docs/insomnia-testes.json` (26 requisições em 3 pastas), com token e IDs encadeados automaticamente via *response tags*.

## 7 — 23/11 · Claude
**Prompt:** resultados dos testes (T5 120.5 · T8 `2026-11-25T00:00:00.000Z` · T9 400 · T10/T12 400)
**Resultado:** confirmou bug de fuso (T8) e corrigiu; blindou IDs inválidos e erros async (T9) com `validaId` + error handler.

## 8 — 23/11 · Claude
**Prompt:** "slides"
**Resultado:** apresentação de 13 slides montada a partir de `docs/`: requisitos, sistema, arquitetura, IA, prompts, modelo, código, testes, problemas, números, demo, conclusões.
