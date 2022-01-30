

import '@applitools/eyes-cypress/commands'

Cypress.Cookies.defaults({
  preserve: 'trello_token'
})
// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
