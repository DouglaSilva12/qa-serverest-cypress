# QA ServeRest Cypress

Projeto Cypress em JavaScript criado para atender ao teste tecnico:

- 3 cenarios E2E automatizados no frontend `https://front.serverest.dev`
- 3 cenarios automatizados na API `https://serverest.dev`

## Tecnologias

- Cypress
- JavaScript
- Node.js

## Cenarios Cobertos

### Frontend

1. Cadastro de usuario comum pela tela e redirecionamento para a loja.
2. Login invalido exibindo mensagem de erro.
3. Cadastro de produto pelo fluxo de administrador e validacao na listagem.

### API

1. Cadastro de usuario e consulta por ID.
2. Login valido com retorno de token Bearer.
3. Fluxo de produto com cadastro, consulta, alteracao e exclusao usando administrador autenticado.

## Como Executar

Instale as dependencias:

```bash
npm install
```

Execute todos os testes:

```bash
npm test
```

Execute apenas API:

```bash
npm run test:api
```

Execute apenas frontend:

```bash
npm run test:e2e
```

Abra o Cypress em modo interativo:

```bash
npm run cy:open
```

## Organizacao

- `cypress/e2e/api`: cenarios da API.
- `cypress/e2e/frontend`: cenarios E2E do frontend.
- `cypress/support/commands.js`: comandos reutilizaveis para criacao de massa, autenticacao e limpeza.
- `cypress.config.js`: URLs base, timeouts, viewport e retries.

Cada cenario fica em um arquivo separado:

- `cypress/e2e/api/01-cadastro-usuario-api.cy.js`
- `cypress/e2e/api/02-login-api.cy.js`
- `cypress/e2e/api/03-produto-api.cy.js`
- `cypress/e2e/frontend/01-cadastro-usuario-front.cy.js`
- `cypress/e2e/frontend/02-login-invalido-front.cy.js`
- `cypress/e2e/frontend/03-cadastro-produto-front.cy.js`

Os testes criam dados unicos em tempo de execucao e removem usuarios/produtos ao final dos cenarios sempre que possivel.

## Evidencias

As evidencias de execucao ficam em `evidencias/execucoes`, separadas por data.

Execucao registrada:

- `evidencias/execucoes/2026-05-12/resumo.md`
- `evidencias/execucoes/2026-05-12/logs/npm-test-completo.txt`
- `evidencias/execucoes/2026-05-12/prints/frontend`
