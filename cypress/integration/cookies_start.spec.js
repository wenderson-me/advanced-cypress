///<reference types="cypress"/>



describe('Cookies', () => {

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('trello_token')
    cy.visit('/')
  });

  it('test #1', () => {

    cy.setCookie('trello_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndlbmR5QGV4YW1wbGUuY29tIiwiaWF0IjoxNjQzMDc2OTc3LCJleHAiOjE2NDMwODA1NzcsInN1YiI6IjEifQ.vYXKtFCpZMrolNAlcTuF2hQrx-I9dRtIPAQgnIIewoM')

    cy.reload()

  })
  it('test #2', () => {

  });

  it('test #3', () => {

  });

});

