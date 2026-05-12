describe("ServeRest API - cadastro de usuário", () => {
  // Guardo os usuários criados aqui para deixar a API limpa no fim do cenário.
  const createdUsers = [];

  afterEach(() => {
    // Limpeza simples da massa criada durante o teste.
    while (createdUsers.length) {
      cy.deleteUserById(createdUsers.pop());
    }
  });

  it("cadastra usuário e consulta os dados pelo id", () => {
    // Primeiro crio um usuário único pela API para o teste não depender de massa fixa.
    cy.createUser({
      nome: "José Douglas API Cypress",
      administrador: "false",
    }).then((user) => {
      createdUsers.push(user.id);

      // Depois busco pelo ID que acabou de ser gerado.
      cy.request("GET", `${Cypress.expose("apiUrl")}/usuarios/${user.id}`).then(
        ({ status, body }) => {
          // A validação confere o status e os campos que realmente importam para o contrato.
          expect(status).to.eq(200);
          expect(body).to.include({
            nome: user.nome,
            email: user.email,
            password: user.password,
            administrador: user.administrador,
            _id: user.id,
          });
        },
      );
    });
  });
});
