///<reference types="cypress"/>

it('Installing plugins', () => {

  cy.visit('/board/21241490123')

  cy.get('[data-cy=task]')
    .eq(0)
    .as('task2')

  cy.get('[data-cy=task]')
    .eq(1)
    .as('task1')

  cy.get('@task2')
    .drag('@task1')

});

it('Upload file', () => {

  cy.visit('/board/21241490123')

  cy.get('[data-cy=task]')
    .eq(0)
    .click()

  cy.get('.dropzone')
    .attachFile('logo.jpg', { subjectType: 'drag-n-drop' })
});

it('See hover events', () => {

  cy.visit('/')

  cy.get('[data-cy="board-item"]').realHover().should('have.css', 'background-color', 'rgb(5, 90, 140)')
});


it('Eyes applitools', () => {
  cy.visit('/')

  cy.eyesOpen({
    appName: 'Trello app',
    testName: 'Trying out Applitools plugin',
    browser: { width: 800, height: 600 },
  });
  cy.eyesCheckWindow('Board list');

  cy.eyesClose();
});
