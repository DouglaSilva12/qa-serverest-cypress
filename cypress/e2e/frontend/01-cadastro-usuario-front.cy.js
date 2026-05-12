describe("ServeRest Frontend - cadastro de usuário", () => {
  // Tudo que a tela criar vai para cá, assim o cenário se limpa no final.
  const createdUsers = [];

  afterEach(() => {
    // Removo o usuário criado pela tela para não deixar lixo na API pública.
    while (createdUsers.length) {
      cy.deleteUserById(createdUsers.pop());
    }
  });

  it("cadastra usuário comum pela tela e redireciona para a loja", () => {
    // Massa única para o cadastro não esbarrar em outro teste ou em outro candidato.
    const suffix = `${Date.now()}-${Cypress._.random(1000, 9999)}`;
    const user = {
      nome: `José Douglas Cliente Front ${suffix}`,
      email: `jose.douglas.cliente.${suffix}@mailinator.com`,
      password: "Teste@123",
    };

    // Espio as chamadas principais para validar a tela e a API no mesmo fluxo.
    cy.intercept("POST", "**/usuarios").as("postUser");
    cy.intercept("POST", "**/login").as("postLogin");

    // Fluxo real do usuário: abre cadastro, preenche os campos e envia.
    cy.visit("/cadastrarusuarios");
    cy.get("[data-testid=nome]").type(user.nome);
    cy.get("[data-testid=email]").type(user.email);
    cy.get("[data-testid=password]").type(user.password);
    cy.takeEvidenceScreenshot("01-cadastro-usuario-formulario-preenchido");
    cy.get("[data-testid=cadastrar]").click();

    // Confirmo que a API aceitou o cadastro e guardo o ID para limpar depois.
    cy.wait("@postUser").then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      expect(response.body.message).to.eq("Cadastro realizado com sucesso");
      createdUsers.push(response.body._id);
    });

    // A tela precisa mostrar sucesso, fazer login automático e cair na loja.
    cy.contains("Cadastro realizado com sucesso").should("be.visible");
    cy.wait("@postLogin").its("response.statusCode").should("eq", 200);
    cy.location("pathname", { timeout: 12000 }).should("eq", "/home");
    cy.contains("h1", "Serverest Store").should("be.visible");
    cy.get("[data-testid=pesquisar]").should("be.visible");
    cy.takeEvidenceScreenshot("01-cadastro-usuario-loja-apos-cadastro");
  });
});
