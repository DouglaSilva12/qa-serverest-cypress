describe("ServeRest API - produto", () => {
  // Deixo a massa rastreada para conseguir limpar mesmo se o cenário falhar no meio.
  const createdUsers = [];
  const createdProducts = [];

  afterEach(() => {
    // Produto vem primeiro porque precisa do token admin usado no cadastro.
    while (createdProducts.length) {
      const product = createdProducts.pop();
      cy.deleteProductById(product.id, product.authorization);
    }

    // Usuários ficam por último para não quebrar a limpeza do produto.
    while (createdUsers.length) {
      cy.deleteUserById(createdUsers.pop());
    }
  });

  it("cadastra, consulta, altera e exclui produto como administrador", () => {
    // O ServeRest exige administrador para mexer em produtos, então crio um admin só para o fluxo.
    cy.createUser({
      nome: "José Douglas Admin Produto API",
      administrador: "true",
    }).then((admin) => {
      createdUsers.push(admin.id);

      // Com o token em mãos, cadastro o produto que será validado neste fluxo.
      cy.loginByApi(admin.email, admin.password).then((authorization) => {
        cy.createProduct(authorization, {
          preco: 250,
          descricao: "Mouse simples validado pela API.",
          quantidade: 7,
        }).then((product) => {
          createdProducts.push({
            id: product.id,
            authorization,
          });

          // Busco o produto para garantir que o cadastro ficou persistido do jeito certo.
          cy.request("GET", `${Cypress.expose("apiUrl")}/produtos/${product.id}`).then(
            ({ status, body }) => {
              expect(status).to.eq(200);
              expect(body).to.include({
                nome: product.nome,
                preco: product.preco,
                descricao: product.descricao,
                quantidade: product.quantidade,
                _id: product.id,
              });
            },
          );

          // Atualizo o produto para cobrir o PUT e validar uma mudança real.
          cy.request({
            method: "PUT",
            url: `${Cypress.expose("apiUrl")}/produtos/${product.id}`,
            headers: {
              Authorization: authorization,
            },
            body: {
              nome: `${product.nome} Editado`,
              preco: 275,
              descricao: "Mouse simples alterado pela API.",
              quantidade: 9,
            },
          }).then(({ status, body }) => {
            // Confirmação direta da API de que a alteração aconteceu.
            expect(status).to.eq(200);
            expect(body.message).to.eq("Registro alterado com sucesso");
          });

          // Por fim, excluo o produto e tiro ele da fila de limpeza.
          cy.request({
            method: "DELETE",
            url: `${Cypress.expose("apiUrl")}/produtos/${product.id}`,
            headers: {
              Authorization: authorization,
            },
          }).then(({ status, body }) => {
            // Se excluiu aqui, o afterEach não precisa tentar excluir de novo.
            expect(status).to.eq(200);
            expect(body.message).to.eq("Registro excluído com sucesso");
            createdProducts.pop();
          });
        });
      });
    });
  });
});
