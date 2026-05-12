describe("ServeRest Frontend - login inválido", () => {
  it("exibe mensagem de erro ao tentar login com credenciais inválidas", () => {
    // Aqui não preciso criar massa: a ideia é justamente simular um login que não existe.
    cy.intercept("POST", "**/login").as("postLogin");

    // Uso um email único para manter a massa identificável.
    cy.visit("/login");
    cy.get("[data-testid=email]").type(`jose.douglas.invalido.${Date.now()}@mailinator.com`);
    cy.get("[data-testid=senha]").type("senha-invalida");
    cy.takeEvidenceScreenshot("02-login-invalido-formulario-preenchido");
    cy.get("[data-testid=entrar]").click();

    // A API precisa negar e o front precisa mostrar a mensagem certa sem sair da tela.
    cy.wait("@postLogin").its("response.statusCode").should("eq", 401);
    cy.contains("Email e/ou senha inválidos").should("be.visible");
    cy.location("pathname").should("eq", "/login");
    cy.takeEvidenceScreenshot("02-login-invalido-mensagem-de-erro");
  });
});
