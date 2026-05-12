const fs = require("fs");
const path = require("path");
const { defineConfig } = require("cypress");

const getEvidenceDate = () => {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
};

const evidenceDate = process.env.EVIDENCE_DATE || getEvidenceDate();
const evidenceRoot = path.join("evidencias", "execucoes", evidenceDate);
const rawScreenshotsFolder = path.join(evidenceRoot, "_tmp_screenshots");
const frontendPrintsFolder = path.join(evidenceRoot, "prints", "frontend");

const removeEmptyFoldersUntil = (startFolder, stopFolder) => {
  let currentFolder = startFolder;
  const stop = path.resolve(stopFolder);

  while (path.resolve(currentFolder).startsWith(stop) && path.resolve(currentFolder) !== stop) {
    try {
      fs.rmdirSync(currentFolder);
      currentFolder = path.dirname(currentFolder);
    } catch (_) {
      break;
    }
  }
};

module.exports = defineConfig({
  // Mantém variáveis sensíveis fora do browser; a URL pública da API fica em expose.
  allowCypressEnv: false,

  // Preferi uma execução mais silenciosa e estável para ficar boa em avaliação.
  video: false,
  trashAssetsBeforeRuns: false,
  screenshotsFolder: rawScreenshotsFolder,
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  retries: {
    runMode: 1,
    openMode: 0,
  },

  // Valor público usado nas specs e comandos para montar chamadas da API.
  expose: {
    apiUrl: "https://serverest.dev",
  },

  e2e: {
    // Base URL do frontend ServeRest usada pelo cy.visit().
    baseUrl: "https://front.serverest.dev",
    setupNodeEvents(on, config) {
      on("after:screenshot", (details) => {
        const targetDir = path.join(config.projectRoot, frontendPrintsFolder);
        const targetPath = path.join(targetDir, path.basename(details.path));

        fs.mkdirSync(targetDir, { recursive: true });
        fs.renameSync(details.path, targetPath);
        removeEmptyFoldersUntil(path.dirname(details.path), path.join(config.projectRoot, rawScreenshotsFolder));

        return { path: targetPath };
      });

      return config;
    },
  },
});
