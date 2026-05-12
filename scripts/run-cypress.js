const path = require("node:path");

// Alguns terminais deixam o Electron em modo Node. O Cypress precisa do Electron normal.
delete process.env.ELECTRON_RUN_AS_NODE;

// Repassa os argumentos do npm direto para o binário oficial do Cypress.
require(path.join(__dirname, "..", "node_modules", "cypress", "bin", "cypress"));
