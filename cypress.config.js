const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:3000",
    viewportHeight: 500,
    viewportWidth: 700,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.{js,jsx,ts,tsx}",
  },

  env: {},

  retries: {
    runMode: 2,
    openMode: 0,
  },
});
