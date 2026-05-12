describe("ServeRest API - login", () => {
  // Usuário criado só para esse cenário, removido no afterEach.
  const createdUsers = [];

  afterEach(() => {
    // Evita deixar sobras do teste na base pública do ServeRest.
    while (createdUsers.length) {
      cy.deleteUserById(createdUsers.pop());
    }
  });

  it("realiza login com usuário válido e retorna token bearer", () => {
    // Crio o admin na hora para garantir que email e senha são válidos.
    cy.createUser({
      nome: "José Douglas Admin API",
      administrador: "true",
    }).then((user) => {
      createdUsers.push(user.id);

      // Login pela API usando exatamente a massa que acabou de nascer.
      cy.loginByApi(user.email, user.password).then((authorization) => {
        // O retorno precisa ser um Bearer token com cara de JWT.
        expect(authorization).to.match(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);
      });
    });
  });
});
