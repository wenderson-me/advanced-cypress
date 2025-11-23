/// <reference types="cypress" />

import boardPage from '../page-objects/BoardPage';
import apiPage from '../page-objects/ApiPage';

describe('Task/Card Management', () => {

  let boardId;
  let listId;

  beforeEach(() => {
    apiPage.resetDatabase();
    apiPage.createBoard('Task Management Board').then((response) => {
      boardId = response.body.id;

      apiPage.createList(boardId, 'To Do').then((listResponse) => {
        listId = listResponse.body.id;
      });
    });
  });

  describe('Task Creation', () => {

    it('Should create a new task in a list', () => {
      boardPage.visitBoard(boardId);

      const taskName = 'My First Task';
      boardPage.createTaskInList(0, taskName);

      boardPage.shouldHaveTaskInList(0, taskName);
    });

    it('Should create multiple tasks in the same list', () => {
      boardPage.visitBoard(boardId);

      const tasks = ['Task 1', 'Task 2', 'Task 3', 'Task 4'];

      tasks.forEach(taskName => {
        boardPage.createTaskInList(0, taskName);
      });

      boardPage.shouldHaveTaskCountInList(0, 4);

      tasks.forEach(taskName => {
        boardPage.shouldHaveTaskInList(0, taskName);
      });
    });

    it('Should create tasks in different lists', () => {
      apiPage.createList(boardId, 'In Progress');
      apiPage.createList(boardId, 'Done');

      boardPage.visitBoard(boardId);

      boardPage.createTaskInList(0, 'Todo Task');
      boardPage.createTaskInList(1, 'Progress Task');
      boardPage.createTaskInList(2, 'Done Task');

      boardPage.shouldHaveTaskInList(0, 'Todo Task');
      boardPage.shouldHaveTaskInList(1, 'Progress Task');
      boardPage.shouldHaveTaskInList(2, 'Done Task');
    });

    it('Should create task with special characters', () => {
      boardPage.visitBoard(boardId);

      const specialTask = 'Task @#$ 123 !@# ñáéíóú';
      boardPage.createTaskInList(0, specialTask);

      boardPage.shouldHaveTaskInList(0, specialTask);
    });

    it('Should create task with long name', () => {
      boardPage.visitBoard(boardId);

      const longTaskName = 'A'.repeat(200);
      boardPage.createTaskInList(0, longTaskName);

      boardPage.shouldHaveTaskCountInList(0, 1);
    });

    it('Should create task via API', () => {
      const taskName = 'API Created Task';

      apiPage.createCard(listId, taskName).then((response) => {
        apiPage.validateStatusCode(response, 201);
        apiPage.validateResponseHasProperty(response, 'id');
        apiPage.validateResponseHasProperty(response, 'name');
        apiPage.validateResponseProperty(response, 'name', taskName);
      });

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskInList(0, taskName);
    });

    it('Should create task with description via API', () => {
      const taskData = {
        description: 'This is a detailed task description with important information.'
      };

      apiPage.createCard(listId, 'Task with Description', taskData).then((response) => {
        apiPage.validateStatusCode(response, 201);
        apiPage.validateResponseHasProperty(response, 'description');
      });
    });

    it('Should create task with due date via API', () => {
      const dueDate = new Date().toISOString();
      const taskData = {
        dueDate: dueDate
      };

      apiPage.createCard(listId, 'Task with Due Date', taskData).then((response) => {
        apiPage.validateStatusCode(response, 201);
        apiPage.validateResponseHasProperty(response, 'dueDate');
      });
    });

    it('Should create completed task via API', () => {
      const taskData = {
        completed: true
      };

      apiPage.createCard(listId, 'Completed Task', taskData).then((response) => {
        apiPage.validateStatusCode(response, 201);
        apiPage.validateResponseHasProperty(response, 'completed');
      });
    });
  });

  describe('Task Viewing', () => {

    beforeEach(() => {
      apiPage.createCard(listId, 'Test Task');
    });

    it('Should click on task to view details', () => {
      boardPage.visitBoard(boardId);

      boardPage.clickOnTask('Test Task');
      boardPage.shouldShowTaskDetail();
    });

    it('Should close task detail modal', () => {
      boardPage.visitBoard(boardId);

      boardPage.clickOnTask('Test Task');
      boardPage.shouldShowTaskDetail();

      boardPage.closeTaskDetail();
      boardPage.shouldNotBeVisible('task-detail');
    });

    it('Should display task information correctly', () => {
      boardPage.visitBoard(boardId);

      boardPage.clickOnTask('Test Task');
      boardPage.shouldShowTaskDetail();
      boardPage.shouldContainText('task-detail-title', 'Test Task');
    });

    it('Should view all tasks in a list', () => {
      const taskNames = ['Task A', 'Task B', 'Task C', 'Task D', 'Task E'];

      taskNames.forEach(name => {
        apiPage.createCard(listId, name);
      });

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskCountInList(0, 6);

      taskNames.forEach(name => {
        boardPage.shouldHaveTaskInList(0, name);
      });
    });
  });

  describe('Task Edition', () => {

    let taskId;

    beforeEach(() => {
      apiPage.createCard(listId, 'Editable Task').then((response) => {
        taskId = response.body.id;
      });
    });

    it('Should update task name via API', () => {
      const newName = 'Updated Task Name';

      apiPage.updateCard(taskId, { name: newName }).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseProperty(response, 'name', newName);
      });

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskInList(0, newName);
    });

    it('Should update task description via API', () => {
      const newDescription = 'This is the updated description of the task.';

      apiPage.updateCard(taskId, { description: newDescription }).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseProperty(response, 'description', newDescription);
      });
    });

    it('Should mark task as completed via API', () => {
      apiPage.updateCard(taskId, { completed: true }).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseProperty(response, 'completed', true);
      });
    });

    it('Should mark task as incomplete via API', () => {
      apiPage.updateCard(taskId, { completed: false }).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseProperty(response, 'completed', false);
      });
    });

    it('Should move task to different list via API', () => {
      apiPage.createList(boardId, 'In Progress').then((newListResponse) => {
        const newListId = newListResponse.body.id;

        apiPage.updateCard(taskId, { listId: newListId }).then((response) => {
          apiPage.validateStatusCode(response, 200);
          apiPage.validateResponseProperty(response, 'listId', newListId);
        });

        boardPage.visitBoard(boardId);
        boardPage.shouldListBeEmpty(0);
        boardPage.shouldHaveTaskInList(1, 'Editable Task');
      });
    });

    it('Should update multiple task properties at once', () => {
      const updates = {
        name: 'Completely Updated Task',
        description: 'New description',
        completed: true
      };

      apiPage.updateCard(taskId, updates).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseProperty(response, 'name', updates.name);
        apiPage.validateResponseProperty(response, 'description', updates.description);
        apiPage.validateResponseProperty(response, 'completed', updates.completed);
      });
    });
  });

  describe('Task Deletion', () => {

    let taskId;

    beforeEach(() => {
      apiPage.createCard(listId, 'Task to Delete').then((response) => {
        taskId = response.body.id;
      });
    });

    it('Should delete task via API', () => {
      apiPage.deleteCard(taskId).then((response) => {
        apiPage.validateStatusCode(response, 200);
      });

      apiPage.getCard(taskId).then((response) => {
        expect(response.status).to.be.oneOf([404, 400]);
      });
    });

    it('Should remove task from board after deletion', () => {
      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskInList(0, 'Task to Delete');

      apiPage.deleteCard(taskId);

      boardPage.reload();
      boardPage.shouldNotHaveTask('Task to Delete');
    });

    it('Should delete multiple tasks', () => {
      const taskIds = [];

      apiPage.createCard(listId, 'Task 1').then(res => taskIds.push(res.body.id));
      apiPage.createCard(listId, 'Task 2').then(res => taskIds.push(res.body.id));
      apiPage.createCard(listId, 'Task 3').then(res => {
        taskIds.push(res.body.id);

        cy.wrap(null).then(() => {
          taskIds.forEach(id => {
            apiPage.deleteCard(id);
          });

          boardPage.visitBoard(boardId);
          boardPage.shouldListBeEmpty(0);
        });
      });
    });

    it('Should delete task and verify list count', () => {
      apiPage.createCard(listId, 'Task 2');
      apiPage.createCard(listId, 'Task 3');

      boardPage.visitBoard(boardId);
      boardPage.shouldHaveTaskCountInList(0, 3);

      apiPage.deleteCard(taskId);

      boardPage.reload();
      boardPage.shouldHaveTaskCountInList(0, 2);
    });
  });

  describe('Task API Validations', () => {

    it('Should validate task creation response structure', () => {
      apiPage.createCard(listId, 'Validated Task').then((response) => {
        apiPage.validateStatusCode(response, 201);
        apiPage.validateResponseHasProperty(response, 'id');
        apiPage.validateResponseHasProperty(response, 'name');
        apiPage.validateResponseHasProperty(response, 'listId');
        apiPage.validateResponseHasProperty(response, 'completed');
      });
    });

    it('Should get all cards from a list', () => {
      apiPage.createCard(listId, 'Card 1');
      apiPage.createCard(listId, 'Card 2');
      apiPage.createCard(listId, 'Card 3');

      apiPage.getCards(listId).then((response) => {
        apiPage.validateStatusCode(response, 200);
        apiPage.validateResponseIsArray(response);
        apiPage.validateResponseArrayLength(response, 3);
      });
    });

    it('Should get a specific card by ID', () => {
      apiPage.createCard(listId, 'Specific Card').then((createResponse) => {
        const cardId = createResponse.body.id;

        apiPage.getCard(cardId).then((getResponse) => {
          apiPage.validateStatusCode(getResponse, 200);
          apiPage.validateResponseProperty(getResponse, 'id', cardId);
          apiPage.validateResponseProperty(getResponse, 'name', 'Specific Card');
        });
      });
    });

    it('Should return only cards from specific list', () => {
      apiPage.createCard(listId, 'List 1 Card');

      apiPage.createList(boardId, 'List 2').then((list2Response) => {
        const list2Id = list2Response.body.id;
        apiPage.createCard(list2Id, 'List 2 Card');

        apiPage.getCards(listId).then((response) => {
          apiPage.validateResponseArrayLength(response, 1);
          apiPage.validateResponseProperty(response, '[0].name', 'List 1 Card');
        });
      });
    });
  });

  describe('Task Edge Cases', () => {

    it('Should handle creating task in non-existent list', () => {
      const invalidListId = 999999;

      apiPage.createCard(invalidListId, 'Orphan Task').then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('Should handle updating non-existent task', () => {
      const invalidTaskId = 999999;

      apiPage.updateCard(invalidTaskId, { name: 'New Name' }).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('Should handle deleting non-existent task', () => {
      const invalidTaskId = 999999;

      apiPage.deleteCard(invalidTaskId).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('Should handle getting cards from non-existent list', () => {
      const invalidListId = 999999;

      apiPage.getCards(invalidListId).then((response) => {
        // Pode retornar array vazio ou erro
        if (response.status === 200) {
          apiPage.validateResponseIsArray(response);
          apiPage.validateResponseArrayLength(response, 0);
        } else {
          expect(response.status).to.be.oneOf([400, 404]);
        }
      });
    });

    it('Should create task with empty name via API', () => {
      apiPage.createCard(listId, '').then((response) => {
        if (response.status === 201) {
          apiPage.validateResponseProperty(response, 'name', '');
        } else {
          expect(response.status).to.be.oneOf([400, 422]);
        }
      });
    });

    it('Should handle task with invalid completion status', () => {
      apiPage.createCard(listId, 'Test Task').then((createResponse) => {
        const taskId = createResponse.body.id;

        apiPage.updateCard(taskId, { completed: 'invalid' }).then((response) => {
          // API pode aceitar e converter, ou rejeitar
          if (response.status === 200) {
            expect(response.body.completed).to.be.a('boolean');
          } else {
            expect(response.status).to.be.oneOf([400, 422]);
          }
        });
      });
    });
  });

  describe('Task Complex Scenarios', () => {

    it('Should create complete workflow with tasks', () => {
      let inProgressListId, doneListId;

      apiPage.createList(boardId, 'In Progress').then((res) => {
        inProgressListId = res.body.id;
      });

      apiPage.createList(boardId, 'Done').then((res) => {
        doneListId = res.body.id;
      });

      cy.then(() => {
        apiPage.createCard(listId, 'Design Homepage');
        apiPage.createCard(listId, 'Implement Login');

        apiPage.createCard(inProgressListId, 'Fix Bug #123');

        apiPage.createCard(doneListId, 'Setup Project', { completed: true });

        boardPage.visitBoard(boardId);
        boardPage.shouldHaveListCount(3);
        boardPage.shouldHaveTaskCountInList(0, 2);
        boardPage.shouldHaveTaskCountInList(1, 1);
        boardPage.shouldHaveTaskCountInList(2, 1);
      });
    });

    it('Should handle task lifecycle from creation to deletion', () => {
      const taskName = 'Lifecycle Task';
      let taskId;

      apiPage.createCard(listId, taskName).then((response) => {
        taskId = response.body.id;
        apiPage.validateStatusCode(response, 201);
      });

      cy.then(() => {
        boardPage.visitBoard(boardId);
        boardPage.shouldHaveTaskInList(0, taskName);

        const updatedName = 'Updated Lifecycle Task';
        apiPage.updateCard(taskId, {
          name: updatedName,
          description: 'Task description',
          completed: true
        }).then((response) => {
          apiPage.validateStatusCode(response, 200);
        });

        cy.then(() => {
          boardPage.reload();
          boardPage.shouldHaveTaskInList(0, updatedName);

          apiPage.deleteCard(taskId).then((response) => {
            apiPage.validateStatusCode(response, 200);
          });

          cy.then(() => {
            boardPage.reload();
            boardPage.shouldNotHaveTask(updatedName);
          });
        });
      });
    });

    it('Should manage multiple tasks across multiple lists', () => {
      const lists = [
        { name: 'Backlog', tasks: ['Task 1', 'Task 2', 'Task 3'] },
        { name: 'Sprint', tasks: ['Task 4', 'Task 5'] },
        { name: 'Review', tasks: ['Task 6'] },
        { name: 'Done', tasks: ['Task 7', 'Task 8', 'Task 9', 'Task 10'] }
      ];

      lists.forEach(list => {
        apiPage.createList(boardId, list.name).then((listResponse) => {
          const currentListId = listResponse.body.id;

          list.tasks.forEach(taskName => {
            apiPage.createCard(currentListId, taskName);
          });
        });
      });

      cy.then(() => {
        boardPage.visitBoard(boardId);

        boardPage.shouldHaveListCount(5);

        boardPage.shouldHaveTaskCountInList(1, 3);
        boardPage.shouldHaveTaskCountInList(2, 2);
        boardPage.shouldHaveTaskCountInList(3, 1);
        boardPage.shouldHaveTaskCountInList(4, 4);
      });
    });

    it('Should maintain task order in list', () => {
      const orderedTasks = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

      orderedTasks.forEach(taskName => {
        apiPage.createCard(listId, taskName);
      });

      boardPage.visitBoard(boardId);

      orderedTasks.forEach((taskName, index) => {
        boardPage.getTaskFromList(0, index).should('contain', taskName);
      });
    });
  });

  describe('Task Performance', () => {

    it('Should handle list with many tasks', () => {
      const numberOfTasks = 50;
      const taskPromises = [];

      for (let i = 1; i <= numberOfTasks; i++) {
        taskPromises.push(apiPage.createCard(listId, `Task ${i}`));
      }

      Promise.all(taskPromises).then(() => {
        boardPage.visitBoard(boardId);
        boardPage.shouldHaveTaskCountInList(0, numberOfTasks);
      });
    });

    it('Should handle board with multiple lists and many tasks', () => {
      const numLists = 5;
      const tasksPerList = 10;

      for (let i = 1; i <= numLists; i++) {
        apiPage.createList(boardId, `List ${i}`).then((listResponse) => {
          const currentListId = listResponse.body.id;

          for (let j = 1; j <= tasksPerList; j++) {
            apiPage.createCard(currentListId, `Task ${j} in List ${i}`);
          }
        });
      }

      cy.then(() => {
        boardPage.visitBoard(boardId);
        boardPage.shouldHaveListCount(6);
      });
    });
  });
});
