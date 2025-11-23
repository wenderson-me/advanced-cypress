# Estudos Avançados de Cypress

Este repositório é dedicado à exploração e aplicação de conceitos avançados de testes End-to-End (E2E) utilizando o framework Cypress. O objetivo é servir como um guia prático e um campo de estudo para técnicas que vão além do básico.

## 🎯 Objetivo

O foco principal deste projeto é documentar e demonstrar a implementação de padrões e técnicas avançadas em Cypress, incluindo:

* Criação de **Comandos Personalizados** (`custom commands`) para reutilização de código.
* Uso do padrão **Page Objects** para melhor organização e manutenção dos testes.
* Testes de **API** diretamente com o comando `cy.request()`.
* Gestão de **Ambientes e Configurações** Múltiplas.
* Estratégias para lidar com **Autenticação**.

## 💻 Tecnologias Utilizadas

* [**Cypress**](https://www.cypress.io/): O framework principal para os testes E2E.
* [**Node.js**](https://nodejs.org/en): O ambiente de execução para o Cypress.
* [**JavaScript**](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript): A linguagem utilizada para escrever os testes.

## 🚀 Como Executar o Projeto

Para executar os testes localmente na sua máquina, siga os passos abaixo.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/wenderson-me/advanced-cypress.git](https://github.com/wenderson-me/advanced-cypress.git)
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd advanced-cypress
    ```

3.  **Instale as dependências necessárias:**
    ```bash
    npm install
    ```

4.  **Abra o Cypress Test Runner:**
    Este comando irá abrir a interface interativa do Cypress, onde você pode ver e executar todos os testes.
    ```bash
    npm run start
    npm run cy:open
    ```

---
