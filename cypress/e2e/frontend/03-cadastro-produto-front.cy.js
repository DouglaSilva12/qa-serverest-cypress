describe("ServeRest Frontend - cadastro de produto", () => {
  // Dados criados nesse fluxo. Deixo separado para a limpeza ficar óbvia.
  const createdUsers = [];
  const createdProducts = [];

  afterEach(() => {
    // Produto primeiro, porque ele depende do token do admin para ser removido.
    while (createdProducts.length) {
      const product = createdProducts.pop();
      cy.deleteProductById(product.id, product.authorization);
    }

    // Depois removo o admin que foi criado só para esse teste.
    while (createdUsers.length) {
      cy.deleteUserById(createdUsers.pop());
    }
  });

  it("permite que administrador cadastre produto e visualize na listagem", () => {
    // Nome simples para a evidência. O sufixo evita conflito na API pública.
    const productName = `Mouse Teste ${Date.now()}-${Cypress._.random(1000, 9999)}`;
    let adminToken;

    // Crio o administrador por API para o teste focar no cadastro de produto pela tela.
    cy.createUser({
      nome: "José Douglas Admin Front",
      administrador: "true",
    }).then((admin) => {
      createdUsers.push(admin.id);

      // Esse token também será usado na limpeza do produto.
      cy.loginByApi(admin.email, admin.password).then((authorization) => {
        adminToken = authorization;

        // Monitoro as duas chamadas que provam que o front conversou com a API.
        cy.intercept("POST", "**/login").as("postLogin");
        cy.intercept("POST", "**/produtos").as("postProduct");

        // Login feito pela interface, como um administrador faria.
        cy.visit("/login");
        cy.get("[data-testid=email]").type(admin.email);
        cy.get("[data-testid=senha]").type(admin.password);
        cy.get("[data-testid=entrar]").click();

        // Se chegou no painel admin, o login e o redirecionamento funcionaram.
        cy.wait("@postLogin").its("response.statusCode").should("eq", 200);
        cy.location("pathname", { timeout: 10000 }).should("eq", "/admin/home");
        cy.contains("Bem Vindo").should("be.visible");
        cy.takeEvidenceScreenshot("03-cadastro-produto-home-admin");

        // Agora o fluxo principal: cadastrar o produto pelo formulário.
        cy.get("[data-testid=cadastrarProdutos]").click();
        cy.location("pathname").should("eq", "/admin/cadastrarprodutos");
        cy.get("[data-testid=nome]").type(productName);
        cy.get("[data-testid=preco]").type("349");
        cy.get("[data-testid=descricao]").type("Mouse sem fio simples para validar o cadastro pela tela.");
        cy.get("[data-testid=quantity]").type("4");
        cy.takeEvidenceScreenshot("03-cadastro-produto-formulario-preenchido");
        cy.get("[data-testid=cadastarProdutos]").click();

        // Valido a resposta da API e guardo o ID para remover no afterEach.
        cy.wait("@postProduct").then(({ response }) => {
          expect(response.statusCode).to.eq(201);
          expect(response.body.message).to.eq("Cadastro realizado com sucesso");
          createdProducts.push({
            id: response.body._id,
            authorization: adminToken,
          });
        });

        // Por último, a prova visual: produto listado na tela administrativa.
        cy.location("pathname", { timeout: 10000 }).should("eq", "/admin/listarprodutos");
        cy.contains("h1", "Lista dos Produtos").should("be.visible");
        cy.contains("td", productName).should("be.visible");
        cy.takeEvidenceScreenshot("03-cadastro-produto-produto-listado");
      });
    });
  });
});
