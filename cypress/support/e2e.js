// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Import Applitools Eyes for visual testing
import "@applitools/eyes-cypress/commands";

// Configure default cookie preservation
// Note: Cypress.Cookies is deprecated in v12+, use cy.session() instead
// Keeping for backward compatibility
if (Cypress.Cookies) {
  Cypress.Cookies.defaults({
    preserve: "trello_token",
  });
}

// Preserve cookies between tests (modern approach)
beforeEach(() => {
  // Preserve authentication cookies
  Cypress.Cookies.preserveOnce("trello_token", "session_id", "auth_token");
});

// Global error handling
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // você pode adicionar lógica para ignorar certos erros
  console.log("Uncaught exception:", err.message);
  return false;
});

// Custom global configurations
Cypress.config("defaultCommandTimeout", 10000);
Cypress.config("requestTimeout", 10000);
Cypress.config("responseTimeout", 10000);

// Log environment info
cy.log("Cypress version:", Cypress.version);
cy.log("Base URL:", Cypress.config("baseUrl"));
