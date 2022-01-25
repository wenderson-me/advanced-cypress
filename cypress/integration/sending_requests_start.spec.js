///<reference types="cypress"/>

let temp = null
it('Sending requests', () => {
  cy.visit('/')

  cy.request({
    method: 'POST',
    url: '/api/boards',
    body: {
      name: "new board"
    }
  }).then((res) => {
    expect(res.status).to.eq(201)
    temp = res.body.id

    cy.log("id is: " + temp)

    cy.request({
      method: 'PATCH',
      url: '/api/boards/' + temp,
      body: {
        name: "Update Board"
      }
    }).then((res) => {
      expect(res.status).to.eq(200)
      cy.log("id is: " + temp)
    })

    cy.request({
      method: 'DELETE',
      url: '/api/boards/' + temp,
    }).then((res) => {
      expect(res.status).to.eq(200)
    })
  })


});


