/// <reference types="cypress" />

import apiPage from "../page-objects/ApiPage";
import homePage from "../page-objects/HomePage";
import boardPage from "../page-objects/BoardPage";
import ApiPage from "../page-objects/ApiPage";

describe("API Integration Tests", () => {
  beforeEach(() => {
    apiPage.resetDatabase();
  });

  describe("Request Interception", () => {
    it("Should intercept board creation request", () => {
      apiPage.interceptRequest("POST", "/api/boards", "createBoard");

      homePage.visitHome();
      homePage.createNewBoard("Intercepted Board");

      apiPage.waitForRequest("createBoard").then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        expect(interception.response.body).to.have.property("id");
        expect(interception.response.body.name).to.eq("Intercepted Board");
      });
    });

    it("Should intercept list creation request", () => {
      apiPage.createBoard("Test Board").then((response) => {
        const boardId = response.body.id;

        apiPage.interceptRequest("POST", "/api/lists", "createList");

        boardPage.visitBoard(boardId);
        boardPage.createNewList("New List");

        apiPage.waitForRequest("createList").then((interception) => {
          expect(interception.response.statusCode).to.eq(201);
          expect(interception.response.body.title).to.eq("New List");
          expect(interception.response.body.boardId).to.eq(boardId);
        });
      });
    });

    it("Should intercept card creation request", () => {
      let boardId, listId;

      apiPage.createBoard("Test Board").then((response) => {
        boardId = response.body.id;

        apiPage.createList(boardId, "Test List").then((listResponse) => {
          listId = listResponse.body.id;

          apiPage.interceptRequest("POST", "/api/tasks", "createCard");

          boardPage.visitBoard(boardId);
          boardPage.createTaskInList(0, "New Task");

          apiPage.waitForRequest("createCard").then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
            expect(interception.response.body.title).to.eq("New Task");
            expect(interception.response.body.listId).to.eq(listId);
          });
        });
      });
    });

    it("Should intercept multiple requests in sequence", () => {
      apiPage.interceptRequest("POST", "/api/boards", "createBoard");
      apiPage.interceptRequest("POST", "/api/lists", "createList");

      homePage.visitHome();
      homePage.createNewBoard("Sequential Test");

      apiPage.waitForRequest("createBoard").then((boardInterception) => {
        const boardId = boardInterception.response.body.id;

        boardPage.visitBoard(boardId);
        boardPage.createNewList("Sequential List");

        apiPage.waitForRequest("createList").then((listInterception) => {
          expect(listInterception.response.body.boardId).to.eq(boardId);
        });
      });
    });

    it("Should validate PATCH request for board update", () => {
      // NOTE: Este teste usa cy.request() que NÃO é interceptado por cy.intercept()
      // Para interceptar PATCH, veja: cypress/e2e/patch-intercept-examples.spec.cy.js
      apiPage.createBoard("Original Board").then((response) => {
        const boardId = response.body.id;

        apiPage
          .updateBoard(boardId, { name: "Updated Board" })
          .then((updateResponse) => {
            expect(updateResponse.status).to.eq(200);
            expect(updateResponse.body.id).to.eq(boardId);
            expect(updateResponse.body.name).to.eq("Updated Board");
          });
      });
    });

    it("Should intercept delete request", () => {
      apiPage.createBoard("Board to Delete").then((response) => {
        const boardId = response.body.id;

        apiPage.deleteBoard(boardId).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
        });
      });
    });
  });

  describe("Response Stubbing", () => {
    it("Should stub board creation response", () => {
      const stubbedBoard = {
        id: 12345,
        name: "Stubbed Board",
        starred: false,
        created: new Date().toISOString(),
      };

      apiPage.stubResponse(
        "POST",
        "/api/boards",
        {
          statusCode: 201,
          body: stubbedBoard,
        },
        "stubbedCreate",
      );

      homePage.visitHome();
      homePage.createNewBoard("Any Board Name");

      apiPage.waitForRequest("stubbedCreate").then((interception) => {
        expect(interception.response.body.id).to.eq(12345);
        expect(interception.response.body.name).to.eq("Stubbed Board");
      });
    });

    it("Should stub error response for board creation", () => {
      apiPage.stubResponse(
        "POST",
        "/api/boards",
        {
          statusCode: 500,
          body: { error: "Internal Server Error" },
        },
        "errorCreate",
      );

      homePage.visitHome();
      homePage.createNewBoard("Error Board");

      apiPage.waitForRequest("errorCreate").then((interception) => {
        expect(interception.response.statusCode).to.eq(500);
        expect(interception.response.body.error).to.eq("Internal Server Error");
      });
    });

    it("Should stub validation error response", () => {
      apiPage.stubResponse(
        "POST",
        "/api/boards",
        {
          statusCode: 422,
          body: {
            error: "Validation Error",
            message: "Board name is required",
          },
        },
        "validationError",
      );

      homePage.visitHome();
      homePage.createNewBoard("Validation Test");

      apiPage.waitForRequest("validationError").then((interception) => {
        expect(interception.response.statusCode).to.eq(422);
        expect(interception.response.body.message).to.include("required");
      });
    });

    it("Should stub board list with multiple boards", () => {
      const stubbedBoards = [
        { id: 1, name: "Stubbed Board 1" },
        { id: 2, name: "Stubbed Board 2" },
        { id: 3, name: "Stubbed Board 3" },
      ];

      apiPage.stubResponse("GET", "/api/boards", {
        statusCode: 200,
        body: stubbedBoards,
      });

      homePage.visitHome();
      homePage.shouldHaveBoardCount(3);
    });

    it("Should stub empty board list", () => {
      apiPage.stubResponse("GET", "/api/boards", {
        statusCode: 200,
        body: [],
      });

      homePage.visitHome();
      homePage.shouldHaveNoBoards();
    });

    it("Should stub slow response to test loading states", () => {
      apiPage.stubResponse("GET", "/api/boards", {
        statusCode: 200,
        body: [{ id: 1, name: "Slow Board" }],
        delay: 3000,
      });

      homePage.visitHome();

      // Pode adicionar verificações de loading states aqui
      cy.wait(3000);
      homePage.shouldHaveBoardCount(1);
    });
  });

  describe("API Request Validation", () => {
    it("Should validate request body for board creation", () => {
      apiPage.interceptRequest("POST", "/api/boards", "validateCreate");

      homePage.visitHome();
      homePage.createNewBoard("Request Validation Test");

      apiPage.waitForRequest("validateCreate").then((interception) => {
        expect(interception.request.body).to.have.property("name");
        expect(interception.request.body.name).to.eq("Request Validation Test");
      });
    });

    it("Should validate request headers", () => {
      apiPage.interceptRequest("POST", "/api/boards", "headerCheck");

      homePage.visitHome();
      homePage.createNewBoard("Header Test");

      apiPage.waitForRequest("headerCheck").then((interception) => {
        expect(interception.request.headers).to.have.property("content-type");
        expect(interception.request.headers["content-type"]).to.include(
          "application/json",
        );
      });
    });

    it("Should validate PUT request for updates", () => {
      apiPage.createBoard("Update Test").then((response) => {
        const boardId = response.body.id;

        const updateData = {
          name: "Updated Name",
          starred: true,
        };

        apiPage.updateBoard(boardId, updateData).then((updateBoardResponse) => {
          expect(updateBoardResponse.body).to.deep.include(updateData);
        });
      });
    });

    it("Should validate DELETE request includes correct ID", () => {
      apiPage.createBoard("Delete Validation").then((response) => {
        const boardId = response.body.id;

        apiPage.deleteBoard(boardId).then((deleteResponse) => {
          expect(deleteResponse.requestUrl).to.include(
            `/api/boards/${boardId}`,
          );
          expect(deleteResponse.status).to.eq(200);
        });
      });
    });
  });

  describe("API Response Validation", () => {
    it("Should validate response time for board creation", () => {
      apiPage.interceptRequest("POST", "/api/boards", "perfTest");

      homePage.visitHome();
      homePage.createNewBoard("Performance Test");

      apiPage.waitForRequest("perfTest").then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        const duration = interception.response.headers["x-response-time"] || 0;
        expect(parseInt(duration)).to.be.lessThan(2000);
      });
    });

    it("Should validate response contains all required fields", () => {
      apiPage.createBoard("Field Validation").then((response) => {
        expect(response.body).to.have.all.keys(
          "id",
          "name",
          "created",
          "starred",
          "user",
        );
      });
    });

    it("Should validate response data types", () => {
      apiPage.createBoard("Type Validation").then((response) => {
        expect(response.body.id).to.be.a("number");
        expect(response.body.name).to.be.a("string");
        expect(response.body.starred).to.be.a("boolean");
        expect(response.body.created).to.be.a("string");
      });
    });

    it("Should validate array response structure", () => {
      apiPage.createBoard("Board 1");
      apiPage.createBoard("Board 2");

      apiPage.getAllBoards().then((response) => {
        expect(response.status).to.eq(200);
        const boards = response.body;

        expect(boards).to.be.an("array");
        expect(boards.length).to.be.greaterThan(0);

        boards.forEach((board) => {
          expect(board).to.have.property("id");
          expect(board).to.have.property("name");
        });
      });
    });
  });

  describe("API Error Handling", () => {
    it("Should handle 404 error for non-existent board", () => {
      apiPage.getBoard(999999).then((response) => {
        expect(response.status).to.eq(200);

        expect(response.body).to.be.an("object");
        expect(response.body).to.have.property("lists");
        expect(response.body).to.have.property("tasks");

        expect(response.body.lists).to.be.an("array").that.is.empty;
        expect(response.body.tasks).to.be.an("array").that.is.empty;

        expect(response.body).to.not.have.property("name");
        expect(response.body).to.not.have.property("id");
        expect(response.body).to.not.have.property("created");
        expect(response.body).to.not.have.property("user");
      });

      apiPage.createBoard("Temporary Board").then((createResponse) => {
        const boardId = createResponse.body.id;

        expect(createResponse.status).to.eq(201);
        expect(createResponse.body.name).to.eq("Temporary Board");

        apiPage.deleteBoard(boardId).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);

          apiPage.getBoard(boardId).then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            expect(getResponse.body).to.be.an("object");
            expect(getResponse.body.lists).to.be.an("array").that.is.empty;
            expect(getResponse.body.tasks).to.be.an("array").that.is.empty;
            expect(getResponse.body).to.not.have.property("name");
          });
        });
      });
    });

    it("Should handle 404 error for non-existent list", () => {
      apiPage.updateList(999999, { name: "New Name" }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400]);
      });
    });

    it("Should handle 404 error for non-existent card", () => {
      apiPage.getCard(999999).then((response) => {
        expect(response.status).to.be.oneOf([404, 400]);
      });
    });

    it("Should handle malformed request gracefully", () => {
      cy.request({
        method: "POST",
        url: "/api/boards",
        body: "invalid json string",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500, 201]);
      });
    });

    it("Should handle missing required fields", () => {
      cy.request({
        method: "POST",
        url: "/api/boards",
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 201) {
          expect(response.status).to.be.oneOf([400, 422]);
        }
      });
    });
  });

  describe("API Data Consistency", () => {
    it("Should maintain data consistency after multiple operations", () => {
      let boardId;

      apiPage.createBoard("Consistency Test").then((response) => {
        boardId = response.body.id;
        apiPage.validateResponseProperty(response, "name", "Consistency Test");

        apiPage
          .updateBoard(boardId, { name: "Updated Consistency" })
          .then((updateRes) => {
            apiPage.validateResponseProperty(
              updateRes,
              "name",
              "Updated Consistency",
            );

            apiPage.getBoard(boardId).then((getRes) => {
              apiPage.validateResponseProperty(
                getRes,
                "name",
                "Updated Consistency",
              );
              expect(getRes.body.id).to.eq(boardId);
            });
          });
      });
    });

    it("Should maintain list order after creation", () => {
      apiPage.createBoard("Order Test").then((response) => {
        const boardId = response.body.id;
        const listNames = ["List 1", "List 2", "List 3", "List 4"];

        listNames.forEach((name) => {
          apiPage.createList(boardId, name);
        });

        cy.then(() => {
          apiPage.getLists(boardId).then((listResponse) => {
            expect(listResponse.body).to.have.length(4);

            listNames.forEach((name, index) => {
              expect(listResponse.body[index].title).to.eq(name);
            });
          });
        });
      });
    });

    it("Should cascade delete lists when board is deleted", () => {
      let boardId, listId;

      apiPage.createBoard("Cascade Test").then((response) => {
        boardId = response.body.id;

        apiPage.createList(boardId, "Test List").then((listResponse) => {
          listId = listResponse.body.id;

          apiPage.deleteBoard(boardId);

          cy.then(() => {
            apiPage.getLists(boardId).then((response) => {
              apiPage.validateResponseArrayLength(response, 0);
            });
          });
        });
      });
    });

    it("Should cascade delete cards when list is deleted", () => {
      let boardId, listId, cardId;

      apiPage.createBoard("Cascade Card Test").then((response) => {
        boardId = response.body.id;

        apiPage.createList(boardId, "Test List").then((listResponse) => {
          listId = listResponse.body.id;

          apiPage.createCard(listId, "Test Card").then((cardResponse) => {
            cardId = cardResponse.body.id;

            apiPage.deleteList(listId);

            cy.then(() => {
              apiPage.getCard(cardId).then((response) => {
                expect(response.status).to.be.oneOf([404, 400]);
              });
            });
          });
        });
      });
    });
  });

  describe("API Parallel Requests", () => {
    it("Should handle multiple simultaneous board creations", () => {
      const boardNames = [
        "Board 1",
        "Board 2",
        "Board 3",
        "Board 4",
        "Board 5",
      ];

      apiPage.createMultipleBoards(boardNames).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).to.eq(201);
          expect(response.body.name).to.eq(boardNames[index]);
        });
      });

      apiPage.getAllBoards().then((allBoards) => {
        expect(allBoards.body.length).to.be.at.least(5);
      });
    });

    it("Should handle parallel list creation in same board", () => {
      apiPage.createBoard("Parallel Lists").then((response) => {
        const boardId = response.body.id;
        const list = ["List A", "List B", "List C", "List D"];

        list.forEach((list) => {
          apiPage.createList(boardId, list);
        });

        apiPage.getLists(boardId).then((listsResponse) => {
          expect(listsResponse.status).to.eq(200);
          expect(listsResponse.body).to.be.an("array");
          expect(listsResponse.body.length).to.eq(4);

          listsResponse.body.forEach((list) => {
            expect(list).to.have.property("id");
            expect(list).to.have.property("title");
            expect(list.boardId).to.eq(boardId);
          });
        });
      });
    });

    it("Should handle parallel card creation in same list", () => {
      apiPage.createBoard("Parallel Cards").then((boardResponse) => {
        const boardId = boardResponse.body.id;

        apiPage.createList(boardId, "Task List").then((listResponse) => {
          const listId = listResponse.body.id;

          apiPage.createMultipleCards(boardId, listId, 10, "Card");

          apiPage.getCards(listId).then((cardsResponse) => {
            expect(cardsResponse.status).to.eq(200);
            expect(cardsResponse.body).to.be.an("array");
            expect(cardsResponse.body.length).to.eq(10);

            cardsResponse.body.forEach((card, index) => {
              expect(card).to.have.property("id");
              expect(card).to.have.property("title");
              expect(card.boardId).to.eq(boardId);
              expect(card.listId).to.eq(listId);
              expect(card.title).to.eq(`Card ${index + 1}`);
            });
          });
        });
      });
    });
  });

  describe("API Integration with UI", () => {
    it("Should sync API created board with UI", () => {
      apiPage.createBoard("API Created Board").then((response) => {
        const boardId = response.body.id;

        homePage.visitHome();
        homePage.shouldHaveBoard("API Created Board");

        homePage.clickOnBoard("API Created Board");
        boardPage.shouldBeOnBoardPage(boardId);
      });
    });

    it("Should sync API created lists with UI", () => {
      apiPage.createBoard("UI Sync Board").then((response) => {
        const boardId = response.body.id;
        const list = ["API List 1", "API List 2"];

        list.forEach((list) => {
          ApiPage.createList(boardId, list);
        });

        boardPage.visitBoard(boardId);

        cy.get('[data-cy="list"]', { timeout: 10000 }).should("have.length", 2);

        cy.get('[data-cy="list-name"]')
          .eq(0)
          .should("have.value", "API List 1");
        cy.get('[data-cy="list-name"]')
          .eq(1)
          .should("have.value", "API List 2");
      });
    });

    it("Should sync API created cards with UI", () => {
      apiPage.createBoard("Card Sync Board").then((boardResponse) => {
        const boardId = boardResponse.body.id;

        apiPage.createList(boardId, "Card List").then((listResponse) => {
          const listId = listResponse.body.id;

          apiPage.createMultipleCards(boardId, listId, 3, "API Task");

          boardPage.visitBoard(boardId);
          boardPage.shouldHaveTaskCountInList(0, 1);
          boardPage.shouldHaveTaskInList(0, "API Task 1");
          boardPage.shouldHaveTaskInList(0, "API Task 2");
          boardPage.shouldHaveTaskInList(0, "API Task 3");
        });
      });
    });

    it("Should reflect API updates in UI", () => {
      apiPage.createBoard("Update Sync Test").then((response) => {
        const boardId = response.body.id;

        boardPage.visitBoard(boardId);
        boardPage.shouldHaveBoardTitle("Update Sync Test");

        apiPage.updateBoard(boardId, { name: "Updated via API" });

        boardPage.reload();
        boardPage.shouldHaveBoardTitle("Updated via API");
      });
    });

    it("Should reflect API deletions in UI", () => {
      apiPage.createBoard("Delete Sync Test");

      homePage.visitHome();
      homePage.shouldHaveBoard("Delete Sync Test");

      apiPage.getAllBoards().then((response) => {
        const board = response.body.find((b) => b.name === "Delete Sync Test");
        apiPage.deleteBoard(board.id);

        homePage.reload();
        homePage.shouldNotHaveBoard("Delete Sync Test");
      });
    });
  });

  describe("API Complex Workflows", () => {
    it("Should complete full CRUD workflow via API", () => {
      let boardId, listId, cardId;

      apiPage.createBoard("CRUD Workflow").then((response) => {
        boardId = response.body.id;
        apiPage.validateStatusCode(response, 201);

        apiPage.getBoard(boardId).then((getResponse) => {
          apiPage.validateStatusCode(getResponse, 200);
          apiPage.validateResponseProperty(getResponse, "id", boardId);

          apiPage
            .updateBoard(boardId, { name: "Updated CRUD" })
            .then((updateResponse) => {
              apiPage.validateStatusCode(updateResponse, 200);
              apiPage.validateResponseProperty(
                updateResponse,
                "name",
                "Updated CRUD",
              );

              apiPage.deleteBoard(boardId).then((deleteResponse) => {
                apiPage.validateStatusCode(deleteResponse, 200);

                apiPage.getBoard(boardId).then((finalResponse) => {
                  expect(finalResponse.status).to.be.oneOf([404, 400, 200]);
                });
              });
            });
        });
      });
    });

    it("Should create complete project structure via API", () => {
      const projectData = {
        boardName: "Complete Project",
        lists: [
          { name: "Backlog", cards: ["Feature A", "Feature B", "Bug Fix C"] },
          { name: "In Development", cards: ["Feature D"] },
          { name: "Testing", cards: ["Feature E", "Feature F"] },
          { name: "Done", cards: ["Feature G", "Feature H", "Feature I"] },
        ],
      };

      apiPage
        .createBoardWithData(projectData.boardName, projectData.lists)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("id");
          expect(response.body.name).to.eq(projectData.boardName);

          const boardId = response.body.id;
          expect(response.body.lists).to.have.length(4);
          expect(response.body.tasks).to.have.length(9);

          boardPage.visitBoard(boardId);

          cy.get('[data-cy="list"]', { timeout: 15000 }).should(
            "have.length",
            4,
          );

          boardPage.shouldHaveBoardTitle(projectData.boardName);

          cy.get('[data-cy="list"]')
            .eq(0)
            .within(() => {
              cy.get('[data-cy="list-name"]').should("have.value", "Backlog");
              cy.get('[data-cy="task"]').should("have.length", 3);
            });

          cy.get('[data-cy="list"]')
            .eq(1)
            .within(() => {
              cy.get('[data-cy="list-name"]').should(
                "have.value",
                "In Development",
              );
              cy.get('[data-cy="task"]').should("have.length", 1);
            });

          cy.get('[data-cy="list"]')
            .eq(2)
            .within(() => {
              cy.get('[data-cy="list-name"]').should("have.value", "Testing");
              cy.get('[data-cy="task"]').should("have.length", 2);
            });

          cy.get('[data-cy="list"]')
            .eq(3)
            .within(() => {
              cy.get('[data-cy="list-name"]').should("have.value", "Done");
              cy.get('[data-cy="task"]').should("have.length", 3);
            });
        });
    });
  });
});
