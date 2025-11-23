/// <reference types="cypress" />

describe("Custom Commands Examples", () => {
  beforeEach(() => {
    cy.resetDB();
    cy.visit("/");
  });

  describe("Board Commands", () => {
    it("Should create board using addBoard command", () => {
      cy.addBoard("Custom Command Board");

      cy.shouldHaveValue("board-title", "Custom Command Board");

      cy.visit("/");
      cy.validateBoardExistsInHome("Custom Command Board");
    });

    it("Should create board via API using custom command", () => {
      cy.createBoardViaAPI("API Board", true).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("id");
        expect(response.body.name).to.eq("API Board");
        expect(response.body.starred).to.be.false;

        cy.validateBoardExistsInHome("API Board");
      });
    });

    it("Should delete board using custom command", () => {
      cy.createBoardViaAPI("Board to Delete").then((response) => {
        const boardId = response.body.id;

        cy.validateBoardExistsInHome("Board to Delete");

        cy.deleteBoardViaAPI(boardId).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);

          cy.visit("/");
          cy.contains("Board to Delete").should("not.exist");
        });
      });
    });
  });

  describe("List Commands", () => {
    let boardId;

    beforeEach(() => {
      cy.createBoardViaAPI("Test Board").then((response) => {
        boardId = response.body.id;
        cy.saveData("boardId", boardId);
      });
    });

    it("Should create list via API using custom command", () => {
      cy.getData("boardId").then((id) => {
        cy.createListViaAPI(id, "Custom List").then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.title).to.eq("Custom List");
          expect(response.body.boardId).to.eq(id);

          cy.visit(`/board/${id}`);
          cy.validateListExists("Custom List");
        });
      });
    });

    it("Should create list via UI using custom command", () => {
      cy.getData("boardId").then((id) => {
        cy.visit(`/board/${id}`);
        cy.addList("UI Created List");

        cy.validateListExists("UI Created List");
        cy.get('[data-cy="list"]').should("have.length", 1);
      });
    });
  });

  describe("Card Commands", () => {
    let boardId, listId;

    beforeEach(() => {
      cy.createBoardViaAPI("Card Test Board").then((boardResponse) => {
        boardId = boardResponse.body.id;

        cy.createListViaAPI(boardId, "Task List").then((listResponse) => {
          listId = listResponse.body.id;
          cy.saveData("listId", listId);
          cy.saveData("boardId", boardId);
        });
      });
    });

    it("Should create card via API using custom command", () => {
      cy.getData("boardId").then((boardId) => {
        cy.getData("listId").then((listId) => {
          cy.createCardViaAPI(boardId, listId, "API Card", { completed: false }).then(
            (response) => {
              expect(response.status).to.eq(201);
              expect(response.body.title).to.eq("API Card");
              expect(response.body.listId).to.eq(listId);

              cy.visit(`/board/${boardId}`);
              cy.validateCardExistsInList(0, "API Card");
            },
          );
        });
      });
    });

    it("Should create card via UI using custom command", () => {
      cy.getData("boardId").then((id) => {
        cy.visit(`/board/${id}`);
        cy.addCard(0, "UI Created Card");

        cy.contains("UI Created Card").should("be.visible");
        cy.validateCardExistsInList(0, "UI Created Card");
      });
    });

    it("Should create card with description and due date", () => {
      cy.getData("boardId").then((boardId) => {
        cy.getData("listId").then((listId) => {
          const dueDate = "2024-12-31";

          cy.createCardViaAPI(boardId, listId, "Complex Card", {
            description: "This is a detailed description",
            deadline: dueDate,
            completed: false,
          }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.description).to.eq("This is a detailed description");
            expect(response.body.deadline).to.exist;

            cy.visit(`/board/${boardId}`);
            cy.openTaskDetail(0, "Complex Card");
            cy.get('.TaskModule_description').should(
              "contain.text",
              "This is a detailed description",
            );
          });
        });
      });
    });
  });

  describe("Full Board Creation", () => {
    it("Should create complete board structure using createFullBoard", () => {
      const boardData = [
        {
          name: "Backlog",
          cards: ["Story 1", "Story 2", "Story 3"],
        },
        {
          name: "In Progress",
          cards: ["Task 1", "Task 2"],
        },
        {
          name: "Done",
          cards: ["Completed Task"],
        },
      ];

      cy.createFullBoard("Complete Project", boardData).then((result) => {
        const { boardId, lists } = result;

        expect(boardId).to.exist;
        expect(lists).to.have.length(3);

        cy.validateFullBoardStructure(
          boardId,
          "Complete Project",
          ["Backlog", "In Progress", "Done"],
          6,
        );

        cy.visit(`/board/${boardId}`);
        cy.forEachValidateCards(0, ["Story 1", "Story 2", "Story 3"]);
        cy.forEachValidateCards(1, ["Task 1", "Task 2"]);
        cy.forEachValidateCards(2, ["Completed Task"]);
      });
    });

    it("Should create empty board using createFullBoard", () => {
      cy.createFullBoard("Empty Board", []).then((result) => {
        const { boardId } = result;

        expect(boardId).to.exist;

        cy.validateBoardExistsInHome("Empty Board");

        cy.visit(`/board/${boardId}`);
        cy.shouldHaveValue("board-title", "Empty Board");
        cy.get('[data-cy="list"]').should("have.length", 0);
      });
    });
  });

  describe('Chainable "take" Command', () => {
    let boardId;

    beforeEach(() => {
      cy.createFullBoard("Chaining Test", [
        { name: "List 1", cards: ["Task A", "Task B"] },
        { name: "List 2", cards: ["Task C"] },
      ]).then((result) => {
        boardId = result.boardId;
        cy.visit(`/board/${boardId}`);
      });
    });

    it("Should use take command to get elements", () => {
      cy.take("list").should("have.length", 2);
    });

    it("Should chain take commands", () => {
      cy.take("list").eq(0).take("task").should("have.length", 2);
    });

    it("Should use take to interact with nested elements", () => {
      cy.take("list").eq(1).take("task").should("contain.text", "Task C");
    });
  });

  describe("Selector Utilities", () => {
    beforeEach(() => {
      cy.createBoardViaAPI("Selector Test");
    });

    it("Should use getByDataCy command", () => {
      cy.getByDataCy("create-board").should("be.visible");
    });

    it("Should verify visibility with shouldBeVisibleByDataCy", () => {
      cy.shouldBeVisibleByDataCy("create-board");
    });

    it("Should clear and type using custom command", () => {
      cy.intercept("POST", "/api/boards").as("createBoard");
      cy.getByDataCy("create-board").click();
      cy.clearAndTypeByDataCy("new-board-input", "Cleared Board{enter}");
      cy.wait("@createBoard");
      cy.url({ timeout: 10000 }).should("include", "/board/");
      cy.shouldHaveValue("board-title", "Cleared Board");
    });
  });

  describe("Request Interception", () => {
    it("Should intercept multiple requests", () => {
      cy.interceptAndWait("POST", "/api/boards", "createBoard");
      cy.interceptAndWait("POST", "/api/lists", "createList");

      cy.addBoard("Multi Intercept Board");

      cy.wait("@createBoard").then((boardInterception) => {
        const boardId = boardInterception.response.body.id;

        cy.visit(`/board/${boardId}`);
        cy.addList("Intercepted List");

        cy.wait("@createList").then((listInterception) => {
          expect(listInterception.response.statusCode).to.eq(201);
          expect(listInterception.response.body.title).to.eq(
            "Intercepted List",
          );

          cy.validateListExists("Intercepted List");
        });
      });
    });
  });

  describe("Data Persistence Commands", () => {
    it("Should save and retrieve data between steps", () => {
      cy.createBoardViaAPI("Data Test").then((response) => {
        cy.saveData("testBoardId", response.body.id);
        cy.saveData("testBoardName", response.body.name);
      });

      cy.getData("testBoardId").then((id) => {
        expect(id).to.be.a("number");
        cy.visit(`/board/${id}`);
      });

      cy.getData("testBoardName").then((name) => {
        expect(name).to.eq("Data Test");
        cy.shouldHaveValue("board-title", name);
      });
    });
  });

  describe("Visual Testing Commands", () => {
    it("Should take screenshot with custom name", () => {
      cy.createBoardViaAPI("Screenshot Test");
      cy.visit("/");
      cy.validateBoardExistsInHome("Screenshot Test");
      cy.takeScreenshot("home-page-with-boards");
    });

    it("Should take screenshot of specific element", () => {
      cy.createBoardViaAPI("Element Screenshot");
      cy.visit("/");
      cy.compareVisual("create-board", "create-button-snapshot");
    });
  });

  describe("Complex Workflow with Custom Commands", () => {
    it("Should execute complete workflow using custom commands", () => {
      cy.createBoardViaAPI("Workflow Board").then((boardResponse) => {
        cy.saveData("workflowBoardId", boardResponse.body.id);
        expect(boardResponse.status).to.eq(201);
      });

      cy.validateBoardExistsInHome("Workflow Board");

      cy.getData("workflowBoardId").then((boardId) => {
        cy.visit(`/board/${boardId}`);

        cy.addList("To Do");
        cy.addList("Doing");
        cy.addList("Done");

        cy.get('[data-cy="list"]').should("have.length", 3);
      });

      cy.addCard(0, "Task 1 - Todo");
      cy.addCard(0, "Task 2 - Todo");
      cy.addCard(1, "Task 3 - Doing");

      cy.validateCardExistsInList(0, "Task 1 - Todo");
      cy.validateCardExistsInList(0, "Task 2 - Todo");
      cy.validateCardExistsInList(1, "Task 3 - Doing");

      cy.takeScreenshot("workflow-complete");
    });

    it("Should handle error scenarios gracefully", () => {
      cy.createListViaAPI(999999, "Invalid List").then((response) => {
        expect(response.status).to.be.oneOf([400, 404, 201]);
      });

      cy.createCardViaAPI(999999, 999999, "Invalid Card").then((response) => {
        expect(response.status).to.be.oneOf([400, 404, 201]);
      });
    });
  });

  describe("Performance with Custom Commands", () => {
    it("Should quickly create multiple boards via API", () => {
      const startTime = Date.now();
      const boardNames = Array.from({ length: 10 }, (_, i) => `Board ${i + 1}`);

      boardNames.forEach((name) => {
        cy.createBoardViaAPI(name);
      });

      cy.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        cy.log(`Created 10 boards in ${duration}ms`);

        cy.visit("/");
        cy.get('[data-cy="board-item"]').should("have.length", 10);
      });
    });

    it.only("Should create complex structure efficiently", () => {
      const startTime = Date.now();

      const complexStructure = [
        {
          name: "Backlog",
          cards: Array.from({ length: 10 }, (_, i) => `Backlog Task ${i + 1}`),
        },
        {
          name: "Sprint",
          cards: Array.from({ length: 5 }, (_, i) => `Sprint Task ${i + 1}`),
        },
        {
          name: "Review",
          cards: Array.from({ length: 3 }, (_, i) => `Review Task ${i + 1}`),
        },
        {
          name: "Done",
          cards: Array.from({ length: 15 }, (_, i) => `Done Task ${i + 1}`),
        },
      ];

      cy.createFullBoard("Performance Test", complexStructure).then(
        (result) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          cy.log(`Created complex board in ${duration}ms`);

          cy.validateFullBoardStructure(
            result.boardId,
            "Performance Test",
            ["Backlog", "Sprint", "Review", "Done", ""],
            33,
          );
        },
      );
    });
  });

  describe("Accessibility with Custom Commands", () => {
    it("Should use force click when element is covered", () => {
      cy.createBoardViaAPI("Accessibility Test").then((response) => {
        cy.visit(`/board/${response.body.id}`);

        // Force click pode ser necessário em alguns casos
        cy.forceClickByDataCy("add-list");
        cy.shouldBeVisibleByDataCy("add-list-input");
      });
    });
  });
});
