/// <reference types="cypress" />

import BasePage from "./BasePage";

class BoardPage extends BasePage {
  selectors = {
    boardTitle: "board-title",
    list: "list",
    listName: "list-name",
    listTitle: "list-title",
    createListButton: "add-list",
    newListInput: "add-list-input",
    task: "new-task",
    taskName: "task-name",
    newTaskInput: "task-input",
    createTaskButton: "create-task",
    addCardButton: "new-task",
    taskDetail: "task-detail",
    taskDetailTitle: "task-detail-title",
    taskDetailDescription: "task-detail-description",
    deleteTaskButton: "delete-task",
    closeTaskDetailButton: "close-task-detail",
    editBoardButton: "edit-board",
    deleteBoardButton: "delete-board",
    boardOptions: "board-options",
    listOptions: "list-options",
    deleteListButton: "delete-list",
    taskCheckbox: "task-checkbox",
    taskDueDate: "task-due-date",
    addDueDateButton: "add-due-date",
    dueDatePicker: "due-date-picker",
    saveButton: "save-button",
    cancelButton: "cancel-button",
    homeLink: "home-link",
    starBoardButton: "star-board",
  };

  /**
   * Visita uma página de board específica
   * @param {string} boardId - ID do board
   */
  visitBoard(boardId) {
    return this.visit(`/board/${boardId}`);
  }

  /**
   * Obtém o título do board
   */
  getBoardTitle() {
    return this.getByDataCy(this.selectors.boardTitle);
  }

  /**
   * Verifica se o título do board contém determinado texto
   * @param {string} title - Título esperado
   */
  shouldHaveBoardTitle(title) {
    this.getBoardTitle().should("be.visible").and("have.value", title);
    return this;
  }

  /**
   * Obtém todas as listas do board
   */
  getAllLists() {
    return this.getByDataCy(this.selectors.list);
  }

  /**
   * Obtém uma lista específica por índice
   * @param {number} index - Índice da lista (começando em 0)
   */
  getListByIndex(index) {
    return this.getAllLists().eq(index);
  }

  /**
   * Verifica a quantidade de listas no board
   * @param {number} count - Quantidade esperada
   */
  shouldHaveListCount(count) {
    if (count === 0) {
      this.getAllLists().should("have.length", 0);
    } else {
      this.getAllLists().should("be.visible").and("have.length", count);
    }
    return this;
  }

  /**
   * Clica no botão de criar lista
   */
  clickCreateList() {
    this.clickByDataCy(this.selectors.createListButton);
    return this;
  }

  /**
   * Cria uma nova lista
   * @param {string} listName - Nome da lista
   */
  createNewList(listName) {
    this.clickCreateList();
    this.typeByDataCy(this.selectors.newListInput, `${listName}{enter}`);
    // Aguarda o input desaparecer após criar a lista
    this.getByDataCy(this.selectors.newListInput).should("not.exist");
    return this;
  }

  /**
   * Verifica se uma lista com determinado nome existe
   * @param {string} listName - Nome da lista
   */
  shouldHaveList(listName) {
    this.getByText(listName).should("be.visible");
    return this;
  }

  /**
   * Obtém todas as tarefas de uma lista específica
   * @param {number} listIndex - Índice da lista
   */
  getTasksFromList(listIndex) {
    return this.getListByIndex(listIndex).find(
      `[data-cy="${this.selectors.task}"]`,
    );
  }

  /**
   * Verifica a quantidade de tarefas em uma lista
   * @param {number} listIndex - Índice da lista
   * @param {number} count - Quantidade esperada de tarefas
   */
  shouldHaveTaskCountInList(listIndex, count) {
    if (count === 0) {
      this.getTasksFromList(listIndex).should("have.length", 0);
    } else {
      this.getTasksFromList(listIndex)
        .should("be.visible")
        .and("have.length", count);
    }
    return this;
  }

  /**
   * Clica no botão de adicionar tarefa em uma lista
   * @param {number} listIndex - Índice da lista
   */
  clickAddTaskInList(listIndex) {
    this.getListByIndex(listIndex)
      .find(`[data-cy="${this.selectors.addCardButton}"]`)
      .click();
    return this;
  }

  /**
   * Cria uma nova tarefa em uma lista específica
   * @param {number} listIndex - Índice da lista
   * @param {string} taskName - Nome da tarefa
   */
  createTaskInList(listIndex, taskName) {
    this.clickAddTaskInList(listIndex);
    this.getListByIndex(listIndex)
      .find(`[data-cy="${this.selectors.newTaskInput}"]`)
      .type(`${taskName}{enter}`);
    // Aguarda a tarefa ser criada e aparecer na lista
    this.getListByIndex(listIndex).contains(taskName).should("be.visible");
    return this;
  }

  /**
   * Verifica se uma tarefa existe em uma lista
   * @param {number} listIndex - Índice da lista
   * @param {string} taskName - Nome da tarefa
   */
  shouldHaveTaskInList(listIndex, taskName) {
    this.getListByIndex(listIndex).contains(taskName).should("be.visible");
    return this;
  }

  /**
   * Clica em uma tarefa específica
   * @param {string} taskName - Nome da tarefa
   */
  clickOnTask(taskName) {
    this.getByText(taskName).click();
    return this;
  }

  /**
   * Verifica se o detalhe da tarefa está visível
   */
  shouldShowTaskDetail() {
    this.shouldBeVisible(this.selectors.taskDetail);
    return this;
  }

  /**
   * Fecha o detalhe da tarefa
   */
  closeTaskDetail() {
    this.clickByDataCy(this.selectors.closeTaskDetailButton);
    return this;
  }

  /**
   * Deleta uma tarefa através do modal de detalhes
   */
  deleteTaskFromDetail() {
    this.clickByDataCy(this.selectors.deleteTaskButton);
    return this;
  }

  /**
   * Verifica se uma tarefa não existe
   * @param {string} taskName - Nome da tarefa
   */
  shouldNotHaveTask(taskName) {
    this.getByText(taskName).should("not.exist");
    return this;
  }

  /**
   * Edita o título do board
   * @param {string} newTitle - Novo título
   */
  editBoardTitle(newTitle) {
    this.getBoardTitle().clear().type(`${newTitle}{enter}`);
    // Aguarda o valor ser atualizado
    this.getBoardTitle().should("have.value", newTitle);
    return this;
  }

  /**
   * Abre as opções do board
   */
  openBoardOptions() {
    this.clickByDataCy(this.selectors.boardOptions);
    return this;
  }

  /**
   * Deleta o board
   */
  deleteBoard() {
    this.openBoardOptions();
    this.clickByDataCy(this.selectors.deleteBoardButton);
    return this;
  }

  /**
   * Deleta uma lista
   * @param {number} listIndex - Índice da lista
   */
  deleteList(listIndex) {
    this.getListByIndex(listIndex)
      .find(`[data-cy="${this.selectors.listOptions}"]`)
      .click();
    this.clickByDataCy(this.selectors.deleteListButton);
    return this;
  }

  /**
   * Verifica se está na página do board correto
   * @param {string} boardId - ID do board
   */
  shouldBeOnBoardPage(boardId) {
    this.urlShouldContain(`/board/${boardId}`);
    return this;
  }

  /**
   * Marca uma tarefa como concluída
   * @param {string} taskName - Nome da tarefa
   */
  checkTask(taskName) {
    this.clickOnTask(taskName);
    this.clickByDataCy(this.selectors.taskCheckbox);
    return this;
  }

  /**
   * Adiciona uma descrição à tarefa
   * @param {string} description - Descrição da tarefa
   */
  addTaskDescription(description) {
    this.typeByDataCy(this.selectors.taskDetailDescription, description);
    return this;
  }

  /**
   * Volta para a home
   */
  goToHome() {
    this.clickByDataCy(this.selectors.homeLink);
    return this;
  }

  /**
   * Favorita o board
   */
  starBoard() {
    this.clickByDataCy(this.selectors.starBoardButton);
    return this;
  }

  /**
   * Verifica se uma lista está vazia
   * @param {number} listIndex - Índice da lista
   */
  shouldListBeEmpty(listIndex) {
    this.getTasksFromList(listIndex).should("have.length", 0);
    return this;
  }

  /**
   * Obtém uma tarefa específica de uma lista
   * @param {number} listIndex - Índice da lista
   * @param {number} taskIndex - Índice da tarefa
   */
  getTaskFromList(listIndex, taskIndex) {
    return this.getTasksFromList(listIndex).eq(taskIndex);
  }

  /**
   * Verifica se o botão de criar lista está visível
   */
  shouldShowCreateListButton() {
    this.shouldBeVisible(this.selectors.createListButton);
    return this;
  }

  /**
   * Cancela a criação de uma lista
   */
  cancelListCreation() {
    this.getByDataCy(this.selectors.newListInput).type("{esc}");
    // Aguarda o input desaparecer após cancelar
    this.getByDataCy(this.selectors.newListInput).should("not.exist");
    return this;
  }

  /**
   * Arrasta uma tarefa de uma lista para outra (requer plugin drag-drop)
   * @param {string} taskName - Nome da tarefa
   * @param {number} targetListIndex - Índice da lista de destino
   */
  dragTaskToList(taskName, targetListIndex) {
    cy.contains(taskName).drag(this.getListByIndex(targetListIndex));
    return this;
  }

  /**
   * Verifica que uma tarefa contém um texto específico em uma lista
   * @param {number} listIndex - Índice da lista
   * @param {string} text - Texto esperado
   */
  taskInListShouldContainText(listIndex, text) {
    this.getListByIndex(listIndex).contains(text).should("be.visible");
    return this;
  }
}

export default new BoardPage();
