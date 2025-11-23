require("@4tw/cypress-drag-drop");
import "cypress-real-events/support";
import "cypress-file-upload";

// ============================================
// Custom Commands - Board Management
// ============================================

/**
 * Cria um novo board via UI
 * @param {string} boardName - Nome do board a ser criado
 * @example cy.addBoard('My New Board')
 */
Cypress.Commands.add("addBoard", (boardName) => {
  cy.intercept("POST", "/api/boards").as("createBoard");
  cy.get('[data-cy="create-board"]').should("be.visible").click();
  cy.get("[data-cy=new-board-input]")
    .should("be.visible")
    .type(`${boardName}{enter}`);
  cy.wait("@createBoard").its("response.statusCode").should("eq", 201);
  cy.url({ timeout: 10000 }).should("include", "/board/");
});

/**
 * Cria um board via API
 * @param {string} boardName - Nome do board
 * @param {boolean} starred - Se o board deve ser favoritado (default: false)
 * @example cy.createBoardViaAPI('API Board', true)
 */
Cypress.Commands.add("createBoardViaAPI", (boardName, starred = false) => {
  return cy.request({
    method: "POST",
    url: "/api/boards",
    body: {
      name: boardName,
      starred: starred,
    },
    failOnStatusCode: false,
  });
});

/**
 * Deleta um board via API
 * @param {string|number} boardId - ID do board a ser deletado
 * @example cy.deleteBoardViaAPI(12345)
 */
Cypress.Commands.add("deleteBoardViaAPI", (boardId) => {
  return cy.request({
    method: "DELETE",
    url: `/api/boards/${boardId}`,
    failOnStatusCode: false,
  });
});

/**
 * Cria múltiplos boards via API
 * @param {Array<string>} boardNames - Array com nomes dos boards
 * @example cy.createMultipleBoardsViaAPI(['Board 1', 'Board 2', 'Board 3'])
 */
Cypress.Commands.add("createMultipleBoardsViaAPI", (boardNames) => {
  const boards = [];
  boardNames.forEach((name) => {
    cy.createBoardViaAPI(name).then((response) => {
      boards.push(response.body);
    });
  });
  return cy.wrap(boards);
});

/**
 * Valida que um board existe na home
 * @param {string} boardName - Nome do board
 * @example cy.validateBoardExistsInHome('My Board')
 */
Cypress.Commands.add("validateBoardExistsInHome", (boardName) => {
  cy.visit("/");
  cy.get('[data-cy="board-item"]', { timeout: 10000 })
    .should("exist")
    .contains(boardName)
    .should("be.visible");
});

// ============================================
// Custom Commands - List Management
// ============================================

/**
 * Cria uma lista via API
 * @param {string|number} boardId - ID do board
 * @param {string} listName - Nome da lista
 * @example cy.createListViaAPI(12345, 'To Do')
 */
Cypress.Commands.add("createListViaAPI", (boardId, listName) => {
  return cy.request({
    method: "POST",
    url: "/api/lists",
    body: {
      boardId: boardId,
      title: listName,
    },
    failOnStatusCode: false,
  });
});

/**
 * Cria uma lista via UI
 * @param {string} listName - Nome da lista
 * @example cy.addList('In Progress')
 */
Cypress.Commands.add("addList", (listName) => {
  cy.intercept("POST", "/api/lists").as("createList");
  cy.get('[data-cy="add-list"]').should("be.visible").click();
  cy.get('[data-cy="add-list-input"]')
    .should("be.visible")
    .type(`${listName}{enter}`);
  cy.wait("@createList").its("response.statusCode").should("eq", 201);
});

/**
 * Cria múltiplas listas via API
 * @param {string|number} boardId - ID do board
 * @param {Array<string>} listNames - Array com nomes das listas
 * @example cy.createMultipleListsViaAPI(123, ['To Do', 'Doing', 'Done'])
 */
Cypress.Commands.add("createMultipleListsViaAPI", (boardId, listNames) => {
  const lists = [];
  listNames.forEach((name) => {
    cy.createListViaAPI(boardId, name).then((response) => {
      lists.push(response.body);
    });
  });
  return cy.wrap(lists);
});

/**
 * Valida que uma lista existe no board
 * @param {string} listName - Nome da lista
 * @example cy.validateListExists('To Do')
 */
Cypress.Commands.add("validateListExists", (listName) => {
  cy.get('[data-cy="list-name"]', { timeout: 10000 })
    .filter((index, el) => Cypress.$(el).val() === listName)
    .should("have.length.at.least", 1)
    .first()
    .should("have.value", listName);
});

// ============================================
// Custom Commands - Card/Task Management
// ============================================

/**
 * Cria um card via API
 * @param {string|number} boardId - ID do board
 * @param {string|number} listId - ID da lista
 * @param {string} cardName - Nome do card
 * @param {object} options - Opções adicionais (description, completed, deadline)
 * @example cy.createCardViaAPI(1, 123, 'My Task', { completed: true })
 */
Cypress.Commands.add("createCardViaAPI", (boardId, listId, cardName, options = {}) => {
  const body = {
    boardId: boardId,
    listId: listId,
    title: cardName,
    ...options,
  };

  return cy.request({
    method: "POST",
    url: "/api/tasks",
    body: body,
    failOnStatusCode: false,
  });
});

/**
 * Cria um card via UI em uma lista específica
 * @param {number} listIndex - Índice da lista (começando em 0)
 * @param {string} cardName - Nome do card
 * @example cy.addCard(0, 'New Task')
 */
Cypress.Commands.add("addCard", (listIndex, cardName) => {
  cy.intercept("POST", "/api/cards").as("createCard");

  cy.get('[data-cy="list"]')
    .eq(listIndex)
    .find('[data-cy="new-task"]')
    .should("be.visible")
    .click();

  cy.get('[data-cy="list"]')
    .eq(listIndex)
    .find('[data-cy="task-input"]')
    .should("be.visible")
    .type(`${cardName}{enter}`);

  cy.get('[data-cy="list"]')
    .eq(listIndex)
    .contains(cardName)
    .should("be.visible");
});

/**
 * Cria múltiplos cards via API em uma lista
 * @param {string|number} boardId - ID do board
 * @param {string|number} listId - ID da lista
 * @param {Array<string>} cardNames - Array com nomes dos cards
 * @example cy.createMultipleCardsViaAPI(1, 123, ['Task 1', 'Task 2', 'Task 3'])
 */
Cypress.Commands.add("createMultipleCardsViaAPI", (boardId, listId, cardNames) => {
  const cards = [];
  cardNames.forEach((name) => {
    cy.createCardViaAPI(boardId, listId, name).then((response) => {
      cards.push(response.body);
    });
  });
  return cy.wrap(cards);
});

/**
 * Valida que um card existe na lista
 * @param {number} listIndex - Índice da lista
 * @param {string} cardName - Nome do card
 * @example cy.validateCardExistsInList(0, 'My Task')
 */
Cypress.Commands.add("validateCardExistsInList", (listIndex, cardName) => {
  cy.get('[data-cy="list"]')
    .eq(listIndex)
    .find('[data-cy="task"]')
    .contains(cardName)
    .should("be.visible");
});

/**
 * Abre o modal de detalhes do card clicando na área correta
 * O card tem um checkbox e um label, mas o click.self do Vue só dispara
 * se clicar diretamente no div.Task (não nos elementos filhos)
 * @param {number} listIndex - Índice da lista
 * @param {string} cardName - Nome do card
 * @example cy.openTaskDetail(0, 'My Task')
 */
Cypress.Commands.add("openTaskDetail", (listIndex, cardName) => {
  // Encontra o card e clica com coordenadas específicas na borda
  // para evitar o checkbox e o label
  cy.get('[data-cy="list"]')
    .eq(listIndex)
    .find('[data-cy="task"]')
    .contains(cardName)
    .parents('[data-cy="task"]')
    .first()
    .click("right", { force: true }); // Clica na borda direita
});

// ============================================
// Custom Commands - Data Management
// ============================================

/**
 * Reseta o banco de dados via API
 * @example cy.resetDB()
 */
Cypress.Commands.add("resetDB", () => {
  return cy.request({
    method: "POST",
    url: "/api/reset",
  });
});

/**
 * Cria um board completo com listas e cards
 * @param {string} boardName - Nome do board
 * @param {Array} lists - Array de objetos {name, cards: []}
 * @example
 * cy.createFullBoard('Project', [
 *   { name: 'To Do', cards: ['Task 1', 'Task 2'] },
 *   { name: 'Done', cards: ['Task 3'] }
 * ])
 */
Cypress.Commands.add("createFullBoard", (boardName, lists = []) => {
  let boardId;
  const createdLists = [];

  return cy.createBoardViaAPI(boardName).then((boardRes) => {
    expect(boardRes.status).to.eq(201);
    boardId = boardRes.body.id;

    if (lists.length === 0) {
      return cy.wrap({ boardId, lists: [] });
    }

    // Criar todas as listas primeiro
    const listPromises = [];
    lists.forEach((list) => {
      listPromises.push(
        cy.createListViaAPI(boardId, list.name).then((listRes) => {
          expect(listRes.status).to.eq(201);
          const listData = {
            id: listRes.body.id,
            name: list.name,
            cards: [],
          };
          createdLists.push(listData);

          // Criar cards para esta lista
          if (list.cards && list.cards.length > 0) {
            const cardPromises = [];
            list.cards.forEach((cardName) => {
              cardPromises.push(
                cy
                  .createCardViaAPI(boardId, listRes.body.id, cardName)
                  .then((cardRes) => {
                    if (cardRes.status === 201) {
                      listData.cards.push(cardRes.body);
                    }
                  }),
              );
            });
            return cy.wrap(Promise.all(cardPromises));
          }
        }),
      );
    });

    return cy.wrap(Promise.all(listPromises)).then(() => {
      return cy.wrap({ boardId, lists: createdLists });
    });
  });
});

/**
 * Valida estrutura completa do board (board, listas e cards)
 * @param {number} boardId - ID do board
 * @param {string} boardName - Nome esperado do board
 * @param {Array} expectedLists - Array com nomes das listas esperadas
 * @param {number} expectedCardsCount - Total de cards esperados
 * @example cy.validateFullBoardStructure(123, 'My Board', ['To Do', 'Done'], 5)
 */
Cypress.Commands.add(
  "validateFullBoardStructure",
  (boardId, boardName, expectedLists, expectedCardsCount) => {
    cy.visit(`/board/${boardId}`);

    cy.get('[data-cy="board-title"]', { timeout: 10000 })
      .should("be.visible")
      .and("have.value", boardName);

    if (expectedLists.length > 0) {
      cy.get('[data-cy="list"]').should("have.length", expectedLists.length);

      expectedLists.forEach((listName, index) => {
        cy.get('[data-cy="list"]')
          .eq(index)
          .find('[data-cy="list-name"]')
          .should("have.value", listName)
      });
    }

    if (expectedCardsCount > 0) {
      cy.get('[data-cy="task"]').should("have.length", expectedCardsCount);
    }
  },
);

// ============================================
// Custom Commands - Authentication
// ============================================

/**
 * Faz login via API e salva o token
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @example cy.loginViaAPI('user@example.com', 'password123')
 */
Cypress.Commands.add("loginViaAPI", (email, password) => {
  return cy
    .request({
      method: "POST",
      url: "/api/login",
      body: {
        email: email,
        password: password,
      },
      failOnStatusCode: false,
    })
    .then((response) => {
      if (response.body.token) {
        cy.setCookie("trello_token", response.body.token);
      }
      return response;
    });
});

/**
 * Faz logout via API
 * @example cy.logoutViaAPI()
 */
Cypress.Commands.add("logoutViaAPI", () => {
  return cy.request({
    method: "POST",
    url: "/api/logout",
    failOnStatusCode: false,
  });
});

// ============================================
// Custom Commands - Selectors (Chainable)
// ============================================

/**
 * Comando encadeável para buscar elementos por data-cy
 * Pode ser usado com ou sem subject anterior
 * @param {string} selector - Valor do atributo data-cy
 * @example
 * cy.take('list').eq(0).take('task')
 * cy.take('create-board')
 */
Cypress.Commands.add(
  "take",
  { prevSubject: "optional" },
  (subject, selector) => {
    if (subject) {
      return cy.wrap(subject).find(`[data-cy="${selector}"]`);
    } else {
      return cy.get(`[data-cy="${selector}"]`);
    }
  },
);

/**
 * Obtém elemento por data-cy (alias para clareza)
 * @param {string} selector - Valor do atributo data-cy
 * @example cy.getByDataCy('board-title')
 */
Cypress.Commands.add("getByDataCy", (selector) => {
  return cy.get(`[data-cy="${selector}"]`, { timeout: 10000 });
});

// ============================================
// Custom Commands - Assertions
// ============================================

/**
 * Verifica se um elemento está visível por data-cy
 * @param {string} selector - Valor do atributo data-cy
 * @example cy.shouldBeVisibleByDataCy('create-board')
 */
Cypress.Commands.add("shouldBeVisibleByDataCy", (selector) => {
  cy.get(`[data-cy="${selector}"]`, { timeout: 10000 }).should("be.visible");
});

/**
 * Verifica se um elemento não existe
 * @param {string} selector - Valor do atributo data-cy
 * @example cy.shouldNotExistByDataCy('delete-button')
 */
Cypress.Commands.add("shouldNotExistByDataCy", (selector) => {
  cy.get(`[data-cy="${selector}"]`).should("not.exist");
});

/**
 * Valida se elemento contém um value específico
 * @param {string} selector - Seletor data-cy
 * @param {string} expectedValue - Valor esperado
 * @example cy.shouldHaveValue('board-title', 'My Board')
 */
Cypress.Commands.add("shouldHaveValue", (selector, expectedValue) => {
  cy.get(`[data-cy="${selector}"]`, { timeout: 10000 })
    .should("be.visible")
    .and("have.value", expectedValue);
});

/**
 * Valida se elemento contém um texto específico
 * @param {string} selector - Seletor data-cy
 * @param {string} expectedText - Texto esperado
 * @example cy.shouldContainText('task-title', 'My Task')
 */
Cypress.Commands.add("shouldContainText", (selector, expectedText) => {
  cy.get(`[data-cy="${selector}"]`, { timeout: 10000 })
    .should("be.visible")
    .and("contain.text", expectedText);
});

/**
 * Valida se input contém value (para inputs)
 * @param {string} selector - Seletor data-cy
 * @param {string} expectedValue - Valor esperado
 * @example cy.validateInputValue('board-title', 'My Board')
 */
Cypress.Commands.add("validateInputValue", (selector, expectedValue) => {
  cy.get(`[data-cy="${selector}"]`)
    .should("be.visible")
    .invoke("val")
    .should("eq", expectedValue);
});

/**
 * Valida se elemento contém texto (para spans, divs, etc)
 * @param {string} selector - Seletor data-cy
 * @param {string} expectedText - Texto esperado
 * @example cy.validateElementText('task-name', 'My Task')
 */
Cypress.Commands.add("validateElementText", (selector, expectedText) => {
  cy.get(`[data-cy="${selector}"]`)
    .should("be.visible")
    .invoke("text")
    .should("include", expectedText);
});

// ============================================
// Custom Commands - Wait and Intercept
// ============================================

/**
 * Intercepta e aguarda uma requisição de criação de board
 * @example cy.interceptBoardCreation().then((interception) => { ... })
 */
Cypress.Commands.add("interceptBoardCreation", () => {
  cy.intercept("POST", "/api/boards").as("createBoard");
  return cy.get("@createBoard");
});

/**
 * Intercepta e aguarda uma requisição específica
 * @param {string} method - Método HTTP
 * @param {string} url - URL da requisição
 * @param {string} alias - Nome do alias
 * @example cy.interceptAndWait('POST', '/api/boards', 'createBoard')
 */
Cypress.Commands.add("interceptAndWait", (method, url, alias) => {
  cy.intercept(method, url).as(alias);
});

/**
 * Aguarda e verifica o status code de uma requisição interceptada
 * @param {string} alias - Nome do alias da requisição
 * @param {number} statusCode - Status code esperado
 * @example cy.waitAndValidateStatus('createBoard', 201)
 */
Cypress.Commands.add("waitAndValidateStatus", (alias, statusCode) => {
  cy.wait(`@${alias}`).then((interception) => {
    expect(interception.response.statusCode).to.eq(statusCode);
  });
});

// ============================================
// Custom Commands - Utilities
// ============================================

/**
 * Salva dados em variável compartilhada entre testes
 * @param {string} key - Chave para armazenar
 * @param {*} value - Valor a ser armazenado
 * @example cy.saveData('boardId', 12345)
 */
Cypress.Commands.add("saveData", (key, value) => {
  cy.wrap(value).as(key);
});

/**
 * Obtém dados salvos anteriormente
 * @param {string} key - Chave para recuperar
 * @example cy.getData('boardId').then(id => { ... })
 */
Cypress.Commands.add("getData", (key) => {
  return cy.get(`@${key}`);
});

// ============================================
// Custom Commands - DOM Manipulation
// ============================================

/**
 * Força um clique em elemento mesmo se estiver coberto
 * @param {string} selector - Seletor do elemento
 * @example cy.forceClickByDataCy('hidden-button')
 */
Cypress.Commands.add("forceClickByDataCy", (selector) => {
  cy.get(`[data-cy="${selector}"]`).click({ force: true });
});

/**
 * Limpa e digita em um campo
 * @param {string} selector - Seletor data-cy
 * @param {string} text - Texto a digitar
 * @example cy.clearAndTypeByDataCy('input-field', 'new text')
 */
Cypress.Commands.add("clearAndTypeByDataCy", (selector, text) => {
  cy.get(`[data-cy="${selector}"]`).should("be.visible").clear().type(text);
});

// ============================================
// Custom Commands - Visual Testing
// ============================================

/**
 * Tira screenshot com nome customizado
 * @param {string} name - Nome do screenshot
 * @example cy.takeScreenshot('board-page-loaded')
 */
Cypress.Commands.add("takeScreenshot", (name) => {
  cy.screenshot(name, { capture: "viewport" });
});

/**
 * Compara se um elemento mudou visualmente
 * @param {string} selector - Seletor data-cy
 * @param {string} name - Nome para snapshot
 * @example cy.compareVisual('board-title', 'title-snapshot')
 */
Cypress.Commands.add("compareVisual", (selector, name) => {
  cy.get(`[data-cy="${selector}"]`).screenshot(name);
});

// ============================================
// Custom Commands - Bulk Operations (forEach)
// ============================================

/**
 * Cria múltiplos boards via API e retorna seus IDs
 * @param {Array<{name: string, starred?: boolean}>} boards - Array de configurações de boards
 * @example cy.forEachCreateBoards([{name: 'Board 1'}, {name: 'Board 2', starred: true}])
 */
Cypress.Commands.add("forEachCreateBoards", (boards) => {
  const createdBoards = [];

  boards.forEach((board) => {
    cy.createBoardViaAPI(board.name, board.starred || false).then(
      (response) => {
        expect(response.status).to.eq(201);
        createdBoards.push(response.body);
      },
    );
  });

  return cy.wrap(createdBoards);
});

/**
 * Cria múltiplas listas em um board via API
 * @param {number} boardId - ID do board
 * @param {Array<string>} listNames - Array de nomes das listas
 * @example cy.forEachCreateLists(123, ['To Do', 'Doing', 'Done'])
 */
Cypress.Commands.add("forEachCreateLists", (boardId, listNames) => {
  const createdLists = [];

  listNames.forEach((listName) => {
    cy.createListViaAPI(boardId, listName).then((response) => {
      expect(response.status).to.eq(201);
      createdLists.push(response.body);
    });
  });

  return cy.wrap(createdLists);
});

/**
 * Cria múltiplos cards em uma lista via API
 * @param {number} listId - ID da lista
 * @param {Array<string|object>} cards - Array de nomes ou objetos com configuração dos cards
 * @example cy.forEachCreateCards(123, ['Task 1', 'Task 2', {title: 'Task 3', completed: true}])
 */
Cypress.Commands.add("forEachCreateCards", (listId, cards) => {
  const createdCards = [];

  cards.forEach((card) => {
    const cardName = typeof card === "string" ? card : card.title;
    const options = typeof card === "object" ? card : {};

    cy.createCardViaAPI(listId, cardName, options).then((response) => {
      expect(response.status).to.eq(201);
      createdCards.push(response.body);
    });
  });

  return cy.wrap(createdCards);
});

/**
 * Valida múltiplos boards existem na home
 * @param {Array<string>} boardNames - Array com nomes dos boards
 * @example cy.forEachValidateBoards(['Board 1', 'Board 2', 'Board 3'])
 */
Cypress.Commands.add("forEachValidateBoards", (boardNames) => {
  cy.visit("/");
  cy.get('[data-cy="board-item"]', { timeout: 10000 }).should(
    "have.length",
    boardNames.length,
  );

  boardNames.forEach((boardName) => {
    cy.get('[data-cy="board-item"]').contains(boardName).should("be.visible");
  });
});

/**
 * Valida múltiplas listas existem no board
 * @param {Array<string>} listNames - Array com nomes das listas
 * @example cy.forEachValidateLists(['To Do', 'Doing', 'Done'])
 */
Cypress.Commands.add("forEachValidateLists", (listNames) => {
  cy.get('[data-cy="list"]', { timeout: 10000 }).should(
    "have.length",
    listNames.length,
  );

  listNames.forEach((listName) => {
    cy.validateListExists(listName);
  });
});

/**
 * Valida múltiplos cards existem em uma lista específica
 * @param {number} listIndex - Índice da lista
 * @param {Array<string>} cardNames - Array com nomes dos cards
 * @example cy.forEachValidateCards(0, ['Task 1', 'Task 2', 'Task 3'])
 */
Cypress.Commands.add("forEachValidateCards", (listIndex, cardNames) => {
  cy.get('[data-cy="list"]')
    .eq(listIndex)
    .find('[data-cy="task"]')
    .should("have.length", cardNames.length);

  cardNames.forEach((cardName) => {
    cy.validateCardExistsInList(listIndex, cardName);
  });
});
