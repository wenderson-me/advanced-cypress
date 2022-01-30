require('@4tw/cypress-drag-drop')
import "cypress-real-events/support";
import 'cypress-file-upload';

Cypress.Commands.add('addBoard', (input) => {
  cy.get('[data-cy="create-board"]').click()

  cy.get('[data-cy=new-board-input]').type(input + '{enter}')

})

Cypress.Commands.add('addBoard', () => {

})