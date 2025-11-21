beforeEach(() => {
  cy.visit('/board/35576691619')
});

it('Chaining commands', () => {

  cy.contains('milk')

  cy.get('[data-cy=list]')
    .eq(1)
    .contains('milk')
});