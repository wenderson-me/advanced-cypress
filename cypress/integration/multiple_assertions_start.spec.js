/// <reference types="cypress" />

beforeEach(() => {
  cy.visit('/board/71713860951')
});

it('Multiples Assertions', () => {

  cy.get('[data-cy=task]')
    .should(item => {
      console.log(item)
      if (item.length !== 3) {
        throw new Error('Not enough elements!')
      }
      expect(item[0]).to.contain.text('sugar')
      expect(item[1]).to.contain.text('milk')
    })
});