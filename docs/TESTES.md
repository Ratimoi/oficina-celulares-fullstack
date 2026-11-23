# Testes (executar com API e front rodando, no 4G)

Preencha **Obtido** e **OK?** (✅/❌). Os marcados com ⚠️ são suspeitas de bug levantadas na revisão do código.

| # | Onde | Ação | Esperado | Obtido | OK? |
|---|---|---|---|---|---|
| 1 | Front · Login | Criar conta com senha `abc` | Toast de erro, conta não criada | | |
| 2 | Front · Login | Login com senha errada | "Login ou senha incorretos" | | |
| 3 | Front · Aparelhos | IMEI `123` | Erro de validação | | |
| 4 | Front · OS detalhe | Adicionar 2× "Troca de tela" + 1 outro serviço | Total = soma correta | | |
| 5 | Front · OS detalhe | Remover um item | Total recalculado | | |
| 6 | Front · OS detalhe | Levar OS até ENTREGUE | Data de entrega preenchida, botões somem, Dashboard soma no faturamento | | |
| 7 | Front · Clientes | Excluir cliente que tem aparelho | Toast "Cliente possui aparelhos ou ordens" | | |
| 8 | ⚠️ Front · Nova OS | Previsão = 25/11 | Detalhe mostra 25/11 (suspeita: mostra 24/11 por fuso UTC) | | |
| 9 | ⚠️ Navegador/API | Abrir `http://localhost:3000/ordens/abc` com token (ou sem login: `/login` vazio) | 400/404 (suspeita: servidor trava ou cai, Express 4 não captura erro async) | | |
| 10 | API · Thunder | `PATCH /ordens/1/status` com `{"status":"ABERTA"}` numa OS ENTREGUE | 400 "Não é possível passar de ENTREGUE para ABERTA" | | |

### Como fazer o teste 9 sem Thunder Client
Faça login no front, abra o DevTools (F12) → Console e rode:
```js
fetch("http://localhost:3000/ordens/abc", { headers: { Authorization: "Bearer " + JSON.parse(localStorage.usuario).token } }).then(r => r.status)
```
Depois olhe o terminal da API.
| 11 | API | Listar clientes sem token | 401 | | |
| 12 | API | Adicionar item em OS entregue | 400 "OS encerrada não aceita itens" | | |

Coleção pronta: importar `docs/insomnia-testes.json` no Insomnia.

## Bugs encontrados
| # | Descrição | Causa | Corrigido? |
|---|---|---|---|
| 1 | Previsão 25/11 exibida como 24/11 | API devolve `2026-11-25T00:00:00.000Z` (meia-noite UTC = 24/11 21h em Brasília); front formatava no fuso local | ✅ front formata `previsao` com `timeZone: "UTC"` |
| 2 | ID não numérico (`/ordens/abc`) chegava ao Prisma como `NaN`; erro async não tratado no Express 4 | sem validação de parâmetro nem error handler | ✅ `router.param` com `validaId` + error handler global |

