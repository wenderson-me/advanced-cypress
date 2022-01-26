///<reference types="cypress"/>

it('Stubbing response', () => {

  ///usa mock para adicionar na resposta
  /*
  cy.intercept({
    method: 'GET',
    url: '/api/boards'
  }, {
    fixture: 'threeBoards'
  }
  ).as('boardList')
  */

  ///altera objeto dentro resposta
  cy.intercept({
    method: 'GET',
    url: '/api/boards'
  }, (req) => {
    req.reply((res) => {
      console.log(res)
      res.body[3].starred = true
      return res
    })
  }).as('boardList')

  cy.visit('/')


  ///força erro de conexão
  /*
    cy.intercept({
      method: 'POST',
      url: '/api/boards'
    }, {
      forceNetworkError: true
    }
    ).as('createBoard')
  
    cy.visit('/')
  
    cy.get('[data-cy=create-board]')
      .click()
  
    cy.get('[data-cy="new-board-input"]')
      .type('request wait test{enter}')
  
    cy.get('#errorMessage').should('be.visible')
  
    */
})