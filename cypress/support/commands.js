// Pega a URL pública da API configurada no cypress.config.js.
const apiUrl = () => Cypress.expose("apiUrl");

// Sufixo simples para não bater email ou nome em uma API pública e compartilhada.
const uniqueSuffix = () => `${Date.now()}-${Cypress._.random(1000, 9999)}`;

// Massa padrão para usuários. Cada cenário pode sobrescrever o que precisar.
const buildUser = (overrides = {}) => ({
  nome: `José Douglas QA ${uniqueSuffix()}`,
  email: `jose.douglas.qa.${uniqueSuffix()}@mailinator.com`,
  password: "Teste@123",
  administrador: "false",
  ...overrides,
});

// Massa padrão de produto com nome simples e fácil de reconhecer nas evidências.
const buildProduct = (overrides = {}) => ({
  nome: `Mouse Teste ${uniqueSuffix()}`,
  preco: 199,
  descricao: "Mouse simples usado para validar o cadastro de produto.",
  quantidade: 12,
  ...overrides,
});

// Salva um print de evidência com nome direto e fácil de localizar.
Cypress.Commands.add("takeEvidenceScreenshot", (evidenceName) => {
  cy.screenshot(evidenceName, {
    capture: "fullPage",
  });
});

// Cria usuário pela API e já valida o contrato mínimo que todo teste precisa confiar.
Cypress.Commands.add("createUser", (overrides = {}) => {
  const user = buildUser(overrides);

  return cy
    .request({
      method: "POST",
      url: `${apiUrl()}/usuarios`,
      body: user,
    })
    .then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.message).to.eq("Cadastro realizado com sucesso");
      expect(body._id).to.be.a("string").and.not.be.empty;

      return {
        ...user,
        id: body._id,
      };
    });
});

// Faz login pela API e devolve o token Bearer para os próximos passos.
Cypress.Commands.add("loginByApi", (email, password) => {
  return cy
    .request({
      method: "POST",
      url: `${apiUrl()}/login`,
      body: {
        email,
        password,
      },
    })
    .then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.message).to.eq("Login realizado com sucesso");
      expect(body.authorization).to.match(/^Bearer\s.+/);

      return body.authorization;
    });
});

// Cria produto autenticado como administrador e devolve os dados junto com o ID gerado.
Cypress.Commands.add("createProduct", (authorization, overrides = {}) => {
  const product = buildProduct(overrides);

  return cy
    .request({
      method: "POST",
      url: `${apiUrl()}/produtos`,
      headers: {
        Authorization: authorization,
      },
      body: product,
    })
    .then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.message).to.eq("Cadastro realizado com sucesso");
      expect(body._id).to.be.a("string").and.not.be.empty;

      return {
        ...product,
        id: body._id,
      };
    });
});

// Remove usuário por ID. Na limpeza, é melhor tolerar caso o registro já tenha sumido.
Cypress.Commands.add("deleteUserById", (id) => {
  if (!id) {
    return cy.wrap(null);
  }

  return cy.request({
    method: "DELETE",
    url: `${apiUrl()}/usuarios/${id}`,
    failOnStatusCode: false,
  });
});

// Remove produto por ID usando token admin. Também é tolerante para não mascarar o teste real.
Cypress.Commands.add("deleteProductById", (id, authorization) => {
  if (!id || !authorization) {
    return cy.wrap(null);
  }

  return cy.request({
    method: "DELETE",
    url: `${apiUrl()}/produtos/${id}`,
    headers: {
      Authorization: authorization,
    },
    failOnStatusCode: false,
  });
});
