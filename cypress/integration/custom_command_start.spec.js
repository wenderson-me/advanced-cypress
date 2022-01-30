///<reference types="cypress"/>


/*
beforeEach(() => {
  cy.request('POST', '/api/reset')
});
*/

/*
Cypress.Commands.add('addBoard', (input) => {
  cy.get('[data-cy="create-board"]').click()

  cy.get('[data-cy=new-board-input]').type(input + '{enter}')

})

*/


Cypress.Commands.add('take', { prevSubject: 'optional' }, (subject, input) => {

  if (subject) {
    cy.wrap(subject)
      .find(`[data-cy=${input}]`)
  }
  else {
    cy.get(`[data-cy=${input}]`)
  }

})



it('Custom commands', () => {

  cy.visit('/board/21241490123')

  //cy.addBoard('vndnvsnjvndj')

  cy
    .take('list')
    .eq(0)
    .take('task')

});