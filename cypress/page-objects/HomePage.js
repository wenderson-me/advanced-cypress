/// <reference types="cypress" />

import BasePage from "./BasePage";

class HomePage extends BasePage {
  selectors = {
    createBoardButton: "create-board",
    newBoardInput: "new-board-input",
    boardList: "board-item",
    boardTitle: "board-title",
    firstBoard: "first-board",
    loginButton: "login-button",
    logoutButton: "logout-button",
    userMenu: "user-menu",
    searchInput: "search-input",
    boardCard: "board-card",
  };

  /**
   * Visita a página inicial
   */
  visitHome() {
    return this.visit("/");
  }

  /**
   * Clica no botão de criar board
   */
  clickCreateBoard() {
    this.clickByDataCy(this.selectors.createBoardButton);
    return this;
  }

  /**
   * Digita o nome do novo board
   * @param {string} boardName - Nome do board
   */
  typeNewBoardName(boardName) {
    this.typeByDataCy(this.selectors.newBoardInput, boardName);
    return this;
  }

  /**
   * Cria um novo board
   * @param {string} boardName - Nome do board
   */
  createNewBoard(boardName) {
    cy.intercept("POST", "/api/boards").as("createBoard");

    this.clickCreateBoard();
    this.getByDataCy(this.selectors.newBoardInput).should("be.visible");
    this.typeByDataCy(this.selectors.newBoardInput, `${boardName}{enter}`);
    cy.wait("@createBoard").its("response.statusCode").should("eq", 201);

    cy.url({ timeout: 10000 }).should("include", "/board/");

    cy.visit("/");

    cy.get('[data-cy="create-board"]', { timeout: 10000 }).should("be.visible");

    return this;
  }

  /**
   * Verifica se o botão de criar board está visível
   */
  shouldShowCreateBoardButton() {
    this.shouldBeVisible(this.selectors.createBoardButton);
    return this;
  }

  /**
   * Verifica se um board com determinado nome existe
   * @param {string} boardName - Nome do board
   */
  shouldHaveBoard(boardName) {
    cy.get('[data-cy="board-item"]', { timeout: 10000 }).should("exist");
    cy.get('[data-cy="board-item"]').contains(boardName).should("be.visible");
    return this;
  }

  /**
   * Verifica se um board com determinado nome não existe
   * @param {string} boardName - Nome do board
   */
  shouldNotHaveBoard(boardName) {
    this.getByText(boardName).should("not.exist");
    return this;
  }

  /**
   * Obtém todos os boards listados
   */
  getAllBoards() {
    return this.getByDataCy(this.selectors.boardList);
  }

  /**
   * Clica em um board específico pelo nome
   * @param {string} boardName - Nome do board
   */
  clickOnBoard(boardName) {
    this.getByText(boardName).click();
    return this;
  }

  /**
   * Clica no primeiro board da lista
   */
  clickOnFirstBoard() {
    this.getAllBoards().first().click();
    return this;
  }

  /**
   * Verifica a quantidade de boards
   * @param {number} count - Quantidade esperada
   */
  shouldHaveBoardCount(count) {
    if (count === 0) {
      // Quando não há boards, verifica que não existem
      cy.get('[data-cy="board-item"]').should("not.exist");
    } else {
      // Aguarda os boards serem renderizados com visibilidade
      cy.get('[data-cy="board-item"]', { timeout: 10000 })
        .should("have.length", count)
        .and("be.visible");
    }
    return this;
  }

  /**
   * Espera que o input de novo board esteja visível
   */
  shouldShowNewBoardInput() {
    this.getByDataCy(this.selectors.newBoardInput).should("be.visible");
    return this;
  }

  /**
   * Cancela a criação de um board clicando no botão cancel
   */
  cancelBoardCreation() {
    this.getByDataCy(this.selectors.newBoardInput).should("be.visible");
    // Clica no botão de cancelar
    this.clickByDataCy("new-board-cancel");
    // Aguarda o input desaparecer após cancelar
    this.getByDataCy(this.selectors.newBoardInput).should("not.be.visible");
    return this;
  }

  /**
   * Verifica se está na página inicial
   */
  shouldBeOnHomePage() {
    this.getUrl().should("eq", `${Cypress.config().baseUrl}/`);
    return this;
  }

  /**
   * Busca por um board
   * @param {string} searchTerm - Termo de busca
   */
  searchBoard(searchTerm) {
    this.typeByDataCy(this.selectors.searchInput, searchTerm);
    return this;
  }

  /**
   * Limpa a busca
   */
  clearSearch() {
    this.getByDataCy(this.selectors.searchInput).clear();
    return this;
  }

  /**
   * Faz logout
   */
  logout() {
    this.clickByDataCy(this.selectors.logoutButton);
    return this;
  }

  /**
   * Abre o menu do usuário
   */
  openUserMenu() {
    this.clickByDataCy(this.selectors.userMenu);
    return this;
  }

  /**
   * Obtém o título de um board específico
   * @param {number} index - Índice do board (começando em 0)
   */
  getBoardByIndex(index) {
    return this.getAllBoards().eq(index);
  }

  /**
   * Verifica se a lista de boards está vazia
   */
  shouldHaveNoBoards() {
    this.getAllBoards().should("have.length", 0);
    return this;
  }

  /**
   * Verifica se o input de novo board tem foco
   */
  shouldHaveNewBoardInputFocused() {
    this.getByDataCy(this.selectors.newBoardInput).should("have.focus");
    return this;
  }
}

export default new HomePage();
