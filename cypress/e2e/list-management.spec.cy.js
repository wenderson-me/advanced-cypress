/// <reference types="cypress" />

import boardPage from '../page-objects/BoardPage';
import apiPage from '../page-objects/ApiPage';

describe('List Management', () => {

  let boardId;

  beforeEach(() => {
    apiPage.resetDatabase();
    apiPage.createBoard('Test Board').then((response) => {
      boardId = response.body.id;
    });
  });

  describe('List Creation', () => {

    it('Should create a new list successfully', () => {
      boardPage.visitBoard(boardId);

      const listName = 'My First List';
      boardPage.createNewList(listName);

      boardPage.shouldHaveList(listName);
    });

    it('Should create multiple lists in sequence', () => {
      boardPage.visitBoard(boardId);

      const lists = ['To Do', 'In Progress', 'Done', 'Archived'];

      lists.forEach(listName => {
        boardPage.createNewList(listName);
      });

      boardPage.shouldHaveListCount(4);

      lists.forEach(listName => {
        boardPage.shouldHaveList(listName);
      });
    });

    it('Should display create list button', () => {
      boardPage.visitBoard(boardId);
      boardPage.shouldShowCreateListButton();
    });

    it('Should cancel list creation with ESC key', () => {
      boardPage.visitBoard(boardId);

      boardPage.clickCreateList();
      boardPage.shouldBeVisible('new-list-input');

      boardPage.cancelListCreation();
    });

    it('Should create list with special characters', () => {
      boardPage.visitBoard(boardId);

      const specialListName = 'List @#$ 123 !@#';
      boardPage.createNewList(specialListName);

      boardPage.shouldHaveList(specialListName);
    });

    it('Should create list with long name', () => {
      boardPage.visitBoard(boardId);

      const longListName = 'A'.repeat(100);
      boardPage.createNewList(longListName);

      boardPage.shouldHaveList(longListName);
    });
  });

  describe('List Edition', () => {

    beforeEach(() => {
      apiPage.createList(boardId, 'Original List Name');
    });

    it('Should update list name via API', () => {
      apiPage.getLists(boardId).then((response) => {
        const listId = response.body[0].id;
        const newName = 'Updated List Name';

        apiPage.updateList(listId, { name: newName }).then((updateResponse) => {
          apiPage.validateStatusCode(updateResponse, 200);
          apiPage.validateResponseProperty(updateResponse, 'name', newName);
        });
      });
    });

    it('Should display updated list name on board', () => {
      apiPage.getLists(boardId).then((response) => {
        const listId = response.body[0].id;
        const newName = 'Changed Name';

        apiPage.updateList(listId, { name: newName });

        boardPage.visitBoard(boardId);
        boardPage.shouldHaveList(newName);
      });
    });
  });

  describe('List Deletion', () => {

    beforeEach(() => {
      apiPage.createList(boardId, 'List to Delete');
    });

    it('Should delete a list via API', () => {
      apiPage.getLists(boardId).then((response) => {
        const listId = response.body[0].id;

        apiPage.deleteList(listId).then((deleteResponse) => {
          apiPage.validateStatusCode(deleteResponse, 200);
        });

        apiPage.getLists(boardId).then((listsResponse) => {
          apiPage.validateResponseArrayLength(listsResponse, 0);
        });
      });
    });

    it('Should remove list from board view after deletion', () => {
      boardPage.visitBoard(boardId);
      boardPage.shouldHaveList('List to Delete');

      apiPage.getLists(boardId).then((response) => {
        const listId = response.body[0].id;
        apiPage.deleteList(listId);

        boardPage.reload();
        boardPage.shouldHaveListCount(0);
      });
    });
  });

  describe('Multiple Lists Operations', () => {

    it('Should handle board with multiple lists', () => {
      const listNames = ['Backlog', 'Sprint', 'Testing', 'Production'];

      listNames.forEach(name => {
        apiPage.createList(boardId, name);
      });

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveListCount(4);

      listNames.forEach((name, index) => {
        boardPage.getListByIndex(index).should('contain', name);
      });
    });

    it('Should create lists with same name', () => {
      const sameName = 'Duplicate List';

      boardPage.visitBoard(boardId);

      boardPage.createNewList(sameName);
      boardPage.createNewList(sameName);
      boardPage.createNewList(sameName);

      boardPage.getAllLists().filter(`:contains("${sameName}")`).should('have.length', 3);
    });

    it('Should maintain list order after creation', () => {
      boardPage.visitBoard(boardId);

      const orderedLists = ['First', 'Second', 'Third', 'Fourth'];

      orderedLists.forEach(name => {
        boardPage.createNewList(name);
      });

      orderedLists.forEach((name, index) => {
        boardPage.getListByIndex(index).should('contain', name);
      });
    });
  });

  describe('Empty Lists', () => {

    it('Should display empty list correctly', () => {
      apiPage.createList(boardId, 'Empty List');

      boardPage.visitBoard(boardId);
      boardPage.shouldListBeEmpty(0);
    });

    it('Should handle board without lists', () => {
      boardPage.visitBoard(boardId);
      boardPage.shouldHaveListCount(0);
      boardPage.shouldShowCreateListButton();
    });
  });

  describe('List with Cards', () => {

    let listId;

    beforeEach(() => {
      apiPage.createList(boardId, 'Task List').then((response) => {
        listId = response.body.id;
      });
    });

    it('Should display cards in correct list', () => {
      const cardNames = ['Card 1', 'Card 2', 'Card 3'];

      cardNames.forEach(cardName => {
        apiPage.createCard(listId, cardName);
      });

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskCountInList(0, 3);

      cardNames.forEach(cardName => {
        boardPage.shouldHaveTaskInList(0, cardName);
      });
    });

    it('Should handle list with many cards', () => {
      const numberOfCards = 20;

      for (let i = 1; i <= numberOfCards; i++) {
        apiPage.createCard(listId, `Card ${i}`);
      }

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskCountInList(0, numberOfCards);
    });

    it('Should maintain cards after list update', () => {
      apiPage.createCard(listId, 'Important Card');

      const newListName = 'Renamed List';
      apiPage.updateList(listId, { name: newListName });

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveList(newListName);
      boardPage.shouldHaveTaskInList(0, 'Important Card');
    });
  });

  describe('List API Validations', () => {

    it('Should validate list creation response structure', () => {
      apiPage.createList(boardId, 'Validated List').then((response) => {
        apiPage.validateStatusCode(response, 201);
        apiPage.validateResponseHasProperty(response, 'id');
        apiPage.validateResponseHasProperty(response, 'name');
        apiPage.validateResponseHasProperty(response, 'boardId');
        apiPage.validateResponseProperty(response, 'name', 'Validated List');
      });
    });

    it('Should validate get lists response', () => {
      apiPage.createList(boardId, 'List 1');
      apiPage.createList(boardId, 'List 2');

      apiPage.getLists(boardId).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseIsArray(response);
        apiPage.validateResponseArrayLength(response, 2);
      });
    });

    it('Should return all lists for a specific board', () => {
      apiPage.createList(boardId, 'Board 1 List');

      // Cria outro board com lista
      apiPage.createBoard('Another Board').then((response) => {
        const anotherBoardId = response.body.id;
        apiPage.createList(anotherBoardId, 'Board 2 List');

        apiPage.getLists(boardId).then((listsResponse) => {
          apiPage.validateResponseArrayLength(listsResponse, 1);
          apiPage.validateResponseProperty(listsResponse, '[0].name', 'Board 1 List');
        });
      });
    });
  });

  describe('List Edge Cases', () => {

    it('Should handle creating list without board', () => {
      const invalidBoardId = 999999;

      apiPage.createList(invalidBoardId, 'Orphan List').then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('Should handle updating non-existent list', () => {
      const invalidListId = 999999;

      apiPage.updateList(invalidListId, { name: 'New Name' }).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('Should handle deleting non-existent list', () => {
      const invalidListId = 999999;

      apiPage.deleteList(invalidListId).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('Should create list with empty name via API', () => {
      apiPage.createList(boardId, '').then((response) => {
        if (response.status === 201) {
          apiPage.validateResponseProperty(response, 'name', '');
        } else {
          expect(response.status).to.be.oneOf([400, 422]);
        }
      });
    });
  });
});
