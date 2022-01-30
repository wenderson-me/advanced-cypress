// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

  declare namespace Cypress {
    interface Chainable {
      /**
       * Creates a new board via UI
       * @example .addBoard('board name')
       */
     addBoard()
    }

    interface Chainable {
      /**
       * Take dual element via UI
       * @example .take('example text')
       */
     take()
    }
  }