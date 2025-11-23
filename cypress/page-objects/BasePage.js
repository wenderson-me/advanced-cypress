/// <reference types="cypress" />

class BasePage {
  /**
   * Visita uma URL específica
   * @param {string} url - URL relativa ou absoluta
   */
  visit(url = "/") {
    cy.visit(url);
    return this;
  }

  /**
   * Obtém um elemento pelo seletor data-cy
   * @param {string} selector - Valor do atributo data-cy
   */
  getByDataCy(selector) {
    return cy.get(`[data-cy="${selector}"]`);
  }

  /**
   * Clica em um elemento pelo seletor data-cy
   * @param {string} selector - Valor do atributo data-cy
   */
  clickByDataCy(selector) {
    this.getByDataCy(selector).click();
    return this;
  }

  /**
   * Digita em um campo pelo seletor data-cy
   * @param {string} selector - Valor do atributo data-cy
   * @param {string} text - Texto a ser digitado
   */
  typeByDataCy(selector, text) {
    this.getByDataCy(selector).type(text);
    return this;
  }

  /**
   * Limpa e digita em um campo pelo seletor data-cy
   * @param {string} selector - Valor do atributo data-cy
   * @param {string} text - Texto a ser digitado
   */
  clearAndTypeByDataCy(selector, text) {
    this.getByDataCy(selector).clear().type(text);
    return this;
  }

  /**
   * Verifica se um elemento está visível
   * @param {string} selector - Valor do atributo data-cy
   */
  shouldBeVisible(selector) {
    this.getByDataCy(selector).should("be.visible");
    return this;
  }

  /**
   * Verifica se um elemento não está visível
   * @param {string} selector - Valor do atributo data-cy
   */
  shouldNotBeVisible(selector) {
    this.getByDataCy(selector).should("not.be.visible");
    return this;
  }

  /**
   * Verifica se um elemento existe no DOM
   * @param {string} selector - Valor do atributo data-cy
   */
  shouldExist(selector) {
    this.getByDataCy(selector).should("exist");
    return this;
  }

  /**
   * Verifica se um elemento não existe no DOM
   * @param {string} selector - Valor do atributo data-cy
   */
  shouldNotExist(selector) {
    this.getByDataCy(selector).should("not.exist");
    return this;
  }

  /**
   * Verifica se um elemento contém determinado texto
   * @param {string} selector - Valor do atributo data-cy
   * @param {string} text - Texto esperado
   */
  shouldContainText(selector, text) {
    this.getByDataCy(selector).should("contain", text);
    return this;
  }

  /**
   * Obtém um elemento que contém um texto específico
   * @param {string} text - Texto a ser procurado
   * @param {object} options - Opções adicionais (timeout, etc)
   */
  getByText(text, options = {}) {
    return cy.contains(text, options);
  }

  /**
   * Obtém um elemento que contém um texto específico e garante que está visível
   * @param {string} text - Texto a ser procurado
   * @param {object} options - Opções adicionais (timeout, etc)
   */
  getByTextVisible(text, options = {}) {
    return cy.contains(text, options).should("be.visible");
  }

  /**
   * Espera por um tempo específico (use com moderação)
   * @param {number} milliseconds - Tempo em milissegundos
   */
  wait(milliseconds) {
    cy.wait(milliseconds);
    return this;
  }

  reload() {
    cy.reload();
    return this;
  }

  getUrl() {
    return cy.url();
  }

  /**
   * Verifica se a URL contém um texto específico
   * @param {string} text - Texto esperado na URL
   */
  urlShouldContain(text) {
    cy.url().should("include", text);
    return this;
  }

  /**
   * Obtém elemento por classe CSS
   * @param {string} className - Nome da classe
   */
  getByClass(className) {
    return cy.get(`.${className}`);
  }

  /**
   * Obtém elemento por ID
   * @param {string} id - ID do elemento
   */
  getById(id) {
    return cy.get(`#${id}`);
  }

  /**
   * Faz scroll até um elemento
   * @param {string} selector - Valor do atributo data-cy
   */
  scrollToElement(selector) {
    this.getByDataCy(selector).scrollIntoView();
    return this;
  }

  /**
   * Verifica se um elemento está habilitado
   * @param {string} selector - Valor do atributo data-cy
   */
  shouldBeEnabled(selector) {
    this.getByDataCy(selector).should("be.enabled");
    return this;
  }

  /**
   * Verifica se um elemento está desabilitado
   * @param {string} selector - Valor do atributo data-cy
   */
  shouldBeDisabled(selector) {
    this.getByDataCy(selector).should("be.disabled");
    return this;
  }
}

export default BasePage;
