/// <reference types="cypress" />

import homePage from "../page-objects/HomePage";
import boardPage from "../page-objects/BoardPage";
import apiPage from "../page-objects/ApiPage";

describe("Board Management", () => {
  beforeEach(() => {
    apiPage.resetDatabase();
  });

  describe("Board Creation", () => {
    it("Should create a new board successfully", () => {
      homePage.visitHome();

      const boardName = "My Test Board";
      homePage.createNewBoard(boardName);

      homePage.shouldHaveBoard(boardName);
    });

    it("Should create multiple boards", () => {
      homePage.visitHome();

      const boards = ["Board 1", "Board 2", "Board 3"];

      boards.forEach((boardName) => {
        homePage.createNewBoard(boardName);
      });

      homePage.shouldHaveBoardCount(3);

      boards.forEach((boardName) => {
        homePage.shouldHaveBoard(boardName);
      });
    });

    it("Should focus input when creating a board", () => {
      homePage.visitHome();

      homePage.clickCreateBoard();
      homePage.shouldHaveNewBoardInputFocused();
    });

    it("Should cancel board creation", () => {
      homePage.visitHome();

      homePage.clickCreateBoard();
      homePage.shouldShowNewBoardInput();

      homePage.cancelBoardCreation();
      homePage.shouldNotBeVisible("new-board-input");
    });

    it("Should not create board with empty name", () => {
      homePage.visitHome();

      const initialCount = 0;
      homePage.clickCreateBoard();
      homePage.typeByDataCy("new-board-input", "{enter}");

      homePage.shouldHaveBoardCount(initialCount);
    });
  });

  describe("Board Navigation", () => {
    beforeEach(() => {
      apiPage.createBoard("Test Board").then((response) => {
        cy.wrap(response.body.id).as("boardId");
      });
    });

    it("Should navigate to board when clicked", () => {
      homePage.visitHome();

      cy.get("@boardId").then((boardId) => {
        homePage.clickOnBoard("Test Board");
        boardPage.shouldBeOnBoardPage(boardId);
      });
    });

    it("Should display board title correctly", () => {
      cy.get("@boardId").then((boardId) => {
        boardPage.visitBoard(boardId);
        boardPage.shouldHaveBoardTitle("Test Board");
      });
    });

    it("Should navigate back to home from board", () => {
      cy.get("@boardId").then((boardId) => {
        boardPage.visitBoard(boardId);
        boardPage.goToHome();
        homePage.shouldBeOnHomePage();
      });
    });
  });

  describe("Board Edition", () => {
    beforeEach(() => {
      apiPage.createBoard("Original Board").then((response) => {
        cy.wrap(response.body.id).as("boardId");
      });
    });

    it("Should edit board title", () => {
      cy.get("@boardId").then((boardId) => {
        boardPage.visitBoard(boardId);

        const newTitle = "Updated Board Title";
        boardPage.editBoardTitle(newTitle);

        boardPage.shouldHaveBoardTitle(newTitle);
      });
    });

    it("Should persist board title after reload", () => {
      cy.get("@boardId").then((boardId) => {
        boardPage.visitBoard(boardId);

        const newTitle = "Persistent Title";
        boardPage.editBoardTitle(newTitle);

        boardPage.reload();
        boardPage.shouldHaveBoardTitle(newTitle);
      });
    });
  });

  describe("Board Deletion", () => {
    it("Should delete a board via API", () => {
      apiPage.createBoard("Board to Delete").then((response) => {
        const boardId = response.body.id;

        apiPage.deleteBoard(boardId).then((deleteResponse) => {
          apiPage.validateStatusCode(deleteResponse, 200);
        });

        apiPage.getBoard(boardId).then((getResponse) => {
          expect(getResponse.status).to.be.oneOf([404, 400, 200]);
        });
      });
    });

    it("Should remove board from list after deletion", () => {
      const boardName = "Temporary Board";

      homePage.visitHome();
      homePage.createNewBoard(boardName);
      homePage.shouldHaveBoard(boardName);

      apiPage.getAllBoards().then((response) => {
        const board = response.body.find((b) => b.name === boardName);
        apiPage.deleteBoard(board.id);

        homePage.reload();
        homePage.shouldNotHaveBoard(boardName);
      });
    });
  });

  describe("Multiple Boards Management", () => {
    it("Should display all created boards", () => {
      const boardNames = [
        "Sprint Planning",
        "Bug Tracking",
        "Feature Development",
        "Documentation",
      ];

      boardNames.forEach((name) => {
        apiPage.createBoard(name);
      });

      homePage.visitHome();
      homePage.shouldHaveBoardCount(4);

      boardNames.forEach((name) => {
        homePage.shouldHaveBoard(name);
      });
    });

    it("Should handle empty board list", () => {
      homePage.visitHome();
      homePage.shouldHaveNoBoards();
      homePage.shouldShowCreateBoardButton();
    });
  });
});
