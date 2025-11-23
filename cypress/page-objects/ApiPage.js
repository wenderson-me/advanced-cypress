/// <reference types="cypress" />

class ApiPage {
  endpoints = {
    boards: "/api/boards",
    lists: "/api/lists",
    cards: "/api/tasks",
    reset: "/api/reset",
    login: "/api/login",
    logout: "/api/logout",
    users: "/api/users",
  };

  /**
   * Retorna headers padrão para requisições JSON
   * @returns {Object} - Headers com Accept: application/json
   */
  getJsonHeaders() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Cria um board via API
   * @param {string} name - Nome do board
   * @param {boolean} starred - Se o board deve ser favoritado
   * @returns {Cypress.Chainable} - Response com os dados do board criado
   */
  createBoard(name, starred = false) {
    return cy.request({
      method: "POST",
      url: this.endpoints.boards,
      headers: this.getJsonHeaders(),
      body: {
        name: name,
        starred: starred,
      },
      failOnStatusCode: false,
    });
  }

  /**
   * Obtém todos os boards via API
   * @returns {Cypress.Chainable} - Response com lista de boards
   */
  getAllBoards() {
    return cy.request({
      method: "GET",
      url: this.endpoints.boards,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Obtém um board específico via API
   * @param {string|number} boardId - ID do board
   * @returns {Cypress.Chainable} - Response com dados do board
   */
  getBoard(boardId) {
    return cy.request({
      method: "GET",
      url: `${this.endpoints.boards}/${boardId}`,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Atualiza um board via API
   * @param {string|number} boardId - ID do board
   * @param {object} data - Dados a serem atualizados
   * @returns {Cypress.Chainable} - Response com dados atualizados
   */
  updateBoard(boardId, data) {
    return cy.request({
      method: "PATCH",
      url: `${this.endpoints.boards}/${boardId}`,
      headers: this.getJsonHeaders(),
      body: data,
      failOnStatusCode: false,
    });
  }

  /**
   * Deleta um board via API
   * @param {string|number} boardId - ID do board
   * @returns {Cypress.Chainable} - Response da deleção
   */
  deleteBoard(boardId) {
    const requestUrl = `${this.endpoints.boards}/${boardId}`;
    return cy
      .request({
        method: "DELETE",
        url: requestUrl,
        headers: this.getJsonHeaders(),
        failOnStatusCode: false,
      })
      .then((response) => {
        return { ...response, requestUrl };
      });
  }

  /**
   * Obtém a URL construída para um board específico
   * @param {string|number} boardId - ID do board
   * @returns {string} - URL completa
   */
  getBoardUrl(boardId) {
    return `${this.endpoints.boards}/${boardId}`;
  }

  /**
   * Cria uma lista via API
   * @param {string|number} boardId - ID do board
   * @param {string} title - Título da lista
   * @returns {Cypress.Chainable} - Response com dados da lista criada
   */
  createList(boardId, title) {
    return cy.request({
      method: "POST",
      url: this.endpoints.lists,
      headers: this.getJsonHeaders(),
      body: {
        boardId: boardId,
        title: title,
      },
      failOnStatusCode: false,
    });
  }

  /**
   * Obtém todas as listas de um board via API
   * @param {string|number} boardId - ID do board
   * @returns {Cypress.Chainable} - Response com lista de listas
   */
  getLists(boardId) {
    return cy.request({
      method: "GET",
      url: `${this.endpoints.lists}?boardId=${boardId}`,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Atualiza uma lista via API
   * @param {string|number} listId - ID da lista
   * @param {object} data - Dados a serem atualizados
   * @returns {Cypress.Chainable} - Response com dados atualizados
   */
  updateList(listId, data) {
    return cy.request({
      method: "PATCH",
      url: `${this.endpoints.lists}/${listId}`,
      headers: this.getJsonHeaders(),
      body: data,
      failOnStatusCode: false,
    });
  }

  /**
   * Deleta uma lista via API
   * @param {string|number} listId - ID da lista
   * @returns {Cypress.Chainable} - Response da deleção
   */
  deleteList(listId) {
    return cy.request({
      method: "DELETE",
      url: `${this.endpoints.lists}/${listId}`,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  createMultipleBoards(boardNames) {
    const responses = [];
    boardNames.forEach((boardName) => {
      this.createBoard(boardName).then((response) => {
        responses.push(response);
      });
    });
    return cy.wrap(responses);
  }

  /**
   * Cria um card/tarefa via API
   * @param {string|number} boardId - ID do board
   * @param {string|number} listId - ID da lista
   * @param {string} title - Título do card
   * @param {object} options - Opções adicionais (description, deadline, completed, etc)
   * @returns {Cypress.Chainable} - Response com dados do card criado
   */
  createCard(boardId, listId, title, options = {}) {
    return cy.request({
      method: "POST",
      url: this.endpoints.cards,
      headers: this.getJsonHeaders(),
      body: {
        boardId: boardId,
        listId: listId,
        title: title,
        ...options,
      },
      failOnStatusCode: false,
    });
  }

  /**
   * Cria múltiplos cards via API
   * @param {string|number} boardId - ID do board
   * @param {string|number} listId - ID da lista
   * @param {number} count - Quantidade de cards a criar
   * @param {string} baseTitle - Título base (será numerado: Card 1, Card 2, etc)
   * @returns {void} - Encadeia comandos Cypress
   */
  createMultipleCards(boardId, listId, count, baseTitle = "Card") {
    for (let i = 1; i <= count; i++) {
      this.createCard(boardId, listId, `${baseTitle} ${i}`);
    }
  }

  /**
   * Obtém todos os cards de uma lista via API
   * @param {string|number} listId - ID da lista
   * @returns {Cypress.Chainable} - Response com lista de cards
   */
  getCards(listId) {
    return cy.request({
      method: "GET",
      url: `${this.endpoints.cards}?listId=${listId}`,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Obtém um card específico via API
   * @param {string|number} cardId - ID do card
   * @returns {Cypress.Chainable} - Response com dados do card
   */
  getCard(cardId) {
    return cy.request({
      method: "GET",
      url: `${this.endpoints.cards}/${cardId}`,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Atualiza um card via API
   * @param {string|number} cardId - ID do card
   * @param {object} data - Dados a serem atualizados
   * @returns {Cypress.Chainable} - Response com dados atualizados
   */
  updateCard(cardId, data) {
    return cy.request({
      method: "PATCH",
      url: `${this.endpoints.cards}/${cardId}`,
      headers: this.getJsonHeaders(),
      body: data,
      failOnStatusCode: false,
    });
  }

  /**
   * Deleta um card via API
   * @param {string|number} cardId - ID do card
   * @returns {Cypress.Chainable} - Response da deleção
   */
  deleteCard(cardId) {
    return cy.request({
      method: "DELETE",
      url: `${this.endpoints.cards}/${cardId}`,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Reseta o banco de dados via API
   * @returns {Cypress.Chainable} - Response do reset
   */
  resetDatabase() {
    return cy.request({
      method: "POST",
      url: this.endpoints.reset,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Faz login via API
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Cypress.Chainable} - Response com token de autenticação
   */
  login(email, password) {
    return cy.request({
      method: "POST",
      url: this.endpoints.login,
      headers: this.getJsonHeaders(),
      body: {
        email: email,
        password: password,
      },
      failOnStatusCode: false,
    });
  }

  /**
   * Faz logout via API
   * @returns {Cypress.Chainable} - Response do logout
   */
  logout() {
    return cy.request({
      method: "POST",
      url: this.endpoints.logout,
      headers: this.getJsonHeaders(),
      failOnStatusCode: false,
    });
  }

  /**
   * Cria um usuário via API
   * @param {object} userData - Dados do usuário (email, password, name, etc)
   * @returns {Cypress.Chainable} - Response com dados do usuário criado
   */
  createUser(userData) {
    return cy.request({
      method: "POST",
      url: this.endpoints.users,
      headers: this.getJsonHeaders(),
      body: userData,
      failOnStatusCode: false,
    });
  }

  /**
   * Valida status code da resposta
   * @param {Cypress.Response} response - Objeto de resposta do Cypress
   * @param {number} expectedStatus - Status code esperado
   */
  validateStatusCode(response, expectedStatus) {
    expect(response.status).to.eq(expectedStatus);
  }

  /**
   * Valida que a resposta contém uma propriedade específica
   * @param {Cypress.Response} response - Objeto de resposta do Cypress
   * @param {string} property - Nome da propriedade
   */
  validateResponseHasProperty(response, property) {
    expect(response.body).to.have.property(property);
  }

  /**
   * Valida que a resposta tem uma propriedade com determinado valor
   * @param {Cypress.Response} response - Objeto de resposta do Cypress
   * @param {string} property - Nome da propriedade
   * @param {any} value - Valor esperado
   */
  validateResponseProperty(response, property, value) {
    expect(response.body[property]).to.eq(value);
  }

  /**
   * Cria um board completo com listas e cards via API
   * @param {string} boardName - Nome do board
   * @param {Array} lists - Array de objetos com { name, cards: [] }
   * @returns {Cypress.Chainable} - Response com dados do board criado
   */
  createBoardWithData(boardName, lists = []) {
    return this.createBoard(boardName).then((boardRes) => {
      const boardId = boardRes.body.id;

      const createListsSequentially = (listIndex) => {
        if (listIndex >= lists.length) {
          return this.getBoard(boardId);
        }

        const list = lists[listIndex];

        return this.createList(boardId, list.name).then((listRes) => {
          const listId = listRes.body.id;

          if (list.cards && list.cards.length > 0) {
            const createCardsSequentially = (cardIndex) => {
              if (cardIndex >= list.cards.length) {
                return createListsSequentially(listIndex + 1);
              }

              const cardName = list.cards[cardIndex];
              return this.createCard(boardId, listId, cardName).then(() => {
                return createCardsSequentially(cardIndex + 1);
              });
            };

            return createCardsSequentially(0);
          } else {
            return createListsSequentially(listIndex + 1);
          }
        });
      };

      return createListsSequentially(0);
    });
  }

  /**
   * Deleta todos os boards via API
   */
  deleteAllBoards() {
    return this.getAllBoards().then((res) => {
      if (res.body && res.body.length > 0) {
        const deletePromises = res.body.map((board) => {
          return this.deleteBoard(board.id);
        });
        return Promise.all(deletePromises);
      }
    });
  }

  /**
   * Intercepta uma requisição e cria um alias
   * @param {string} method - Método HTTP
   * @param {string} url - URL a ser interceptada
   * @param {string} alias - Nome do alias
   */
  interceptRequest(method, url, alias) {
    cy.intercept({
      method: method,
      url: url,
    }).as(alias);
  }

  /**
   * Aguarda por uma requisição interceptada
   * @param {string} alias - Nome do alias da requisição
   * @returns {Cypress.Chainable} - Dados da requisição interceptada
   */
  waitForRequest(alias) {
    return cy.wait(`@${alias}`);
  }

  /**
   * Intercepta e stubba uma resposta
   * @param {string} method - Método HTTP
   * @param {string} url - URL a ser interceptada
   * @param {object} response - Resposta mockada
   * @param {string} alias - Nome do alias
   */
  stubResponse(method, url, response, alias = null) {
    const interceptConfig = {
      method: method,
      url: url,
    };

    if (alias) {
      cy.intercept(interceptConfig, response).as(alias);
    } else {
      cy.intercept(interceptConfig, response);
    }
  }

  /**
   * Valida que a resposta é um array
   * @param {Cypress.Response} response - Objeto de resposta do Cypress
   */
  validateResponseIsArray(response) {
    expect(response.body).to.be.an("array");
  }

  /**
   * Valida o tamanho de um array na resposta
   * @param {Cypress.Response} response - Objeto de resposta do Cypress
   * @param {number} length - Tamanho esperado
   */
  validateResponseArrayLength(response, length) {
    expect(response.body).to.have.length(length);
  }
}

export default new ApiPage();
