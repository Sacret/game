class Game {
  static #ROW_LENGTH = 20;
  static #COLUMN_LENGTH = 10;
  static #START_POSITION_X = 3;
  static #CHANGE_DELAY_INTERVAl = 10;

  static #FIGURES = {
    // I
    0: [
      [false, false, false, false],
      [true, true, true, true]
    ],
    // J
    1: [
      [true, false, false],
      [true, true, true]
    ],
    // L
    2: [
      [false, false, true],
      [true, true, true]
    ],
    // O
    3: [
      [true, true],
      [true, true]
    ],
    // S
    4: [
      [false, true, true],
      [true, true, false]
    ],
    // T
    5: [
      [false, true, false],
      [true, true, true]
    ],
    // Z
    6: [
      [true, true, false],
      [false, true, true]
    ],
  };
  static #FIGURES_COUNT = 7;

  static #START_DELAY = 1000;
  static #DIFF_DELAY = 50;
  static #SPEED_DELAY = 100;
  static #MIN_DELAY = 0;
  static #SPLASH_DELAY = 20;

  static #CELL = '▣';
  static #HI_SCORE_LABEL = 'hi-score';

  static #SCORES_LEVEL = {
    0: 0,
    1: 100,
    2: 300,
    3: 700,
    4: 1500,
  };

  static #EMPTY_FIELD =  [...Array(Game.#ROW_LENGTH)].map(
    row => [...Array(Game.#COLUMN_LENGTH)].map(column => false),
  );

  static #SPLASH_SCREEN = [
    [true, true, true, false, true, true, true, false, false, false],
    [false, true, false, false, true, false, false, false, false, false],
    [false, true, false, false, true, true, true, false, false, false],
    [false, true, false, false, true, false, false, false, false, false],
    [false, true, false, false, true, true, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, true, true, true, false, true, true, true],
    [false, false, false, false, true, false, false, true, false, true],
    [false, false, false, false, true, false, false, true, true, true],
    [false, false, false, false, true, false, false, true, true, false],
    [false, false, false, false, true, false, false, true, false, true],
    [false, false, false, false, false, false, false, false, false, false],
    [true, true, true, false, true, true, true, false, false, false],
    [false, true, false, false, true, false, false, false, false, false],
    [false, true, false, false, true, true, true, false, false, false],
    [false, true, false, false, false, false, true, false, false, false],
    [true, true, true, false, true, true, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
  ];

  #scores = 0;
  #figuresCount = 0;
  #step = 0;
  #currentPositionX = Game.#START_POSITION_X;

  #currentTimeoutId = 0;
  #delay = Game.#START_DELAY;
  #currentDelay = this.#delay;

  #field = Game.#EMPTY_FIELD;
  #figure = null;
  #figureField = Game.#EMPTY_FIELD;

  #isGameInProgress = false;
  #isGameOn = false;

  constructor(gameElem, gameInfoElem, scoresElem, hiScoresElem) {
    this.gameElem = gameElem;
    this.gameInfoElem = gameInfoElem;
    this.scoresElem = scoresElem;
    this.hiScoresElem = hiScoresElem;

    this.#setHiScore();
  }

  #setHiScore = () => {
    hiScoresElem.innerText = localStorage.getItem(Game.#HI_SCORE_LABEL) || 0;
  }

  #clearCurrentTimeout = () => {
    clearTimeout(this.#currentTimeoutId);
  }

  #changeDelay = () => {
    if (this.#figuresCount % Game.#CHANGE_DELAY_INTERVAl === 0) {
      this.#delay = this.#delay - Game.#DIFF_DELAY > Game.#SPEED_DELAY
        ? this.#delay - Game.#DIFF_DELAY
        : Game.#SPEED_DELAY;
    }
  };

  #getRandomFigure = () => {
    let rand = Math.random() * Game.#FIGURES_COUNT - 0.5;
    return Game.#FIGURES[Math.round(rand)];
  };

  #getCell = (val) => `<span class="cell ${val ? 'filled' : 'empty'}">${Game.#CELL}</span>`;

  #getAnimation = (splashStep, defaultSplashCell) => {
    const ranges = [19, 28, 47, 55, 73, 80, 97, 103, 119, 124, 139, 143, 157, 160, 173, 175, 187, 188, 199];
    const currentRange = ranges.find(range => splashStep <= range);
    const currentRangeIndex = ranges.findIndex(range => range === currentRange);

    const setStaticCell = (right, up, left, down, i, j) =>
      (i < up || i > Game.#ROW_LENGTH - 1 - down || j < left || j > Game.#COLUMN_LENGTH - 1 - right)
        ? !defaultSplashCell
        : defaultSplashCell;

    return [...Array(Game.#ROW_LENGTH)].map(
      (row, i) => [...Array(Game.#COLUMN_LENGTH)].map((column, j) => {
        let splashCell = defaultSplashCell;

        switch (currentRangeIndex) {
          case 0: case 4: case 8: case 12: case 16: { // up
            const rightLinesCount = (currentRangeIndex + 0) / 4;
            const leftLinesCount = rightLinesCount;
            const upLinesCount = leftLinesCount;
            const downLinesCount = upLinesCount;

            splashCell = setStaticCell(rightLinesCount, upLinesCount, leftLinesCount, downLinesCount, i, j);

            if (currentRange - splashStep + downLinesCount <= i && j === Game.#COLUMN_LENGTH - 1 - rightLinesCount) {
              splashCell = !defaultSplashCell;
            }

            break;
          }
          case 1: case 5: case 9: case 13: case 17: { // left
            const rightLinesCount = (currentRangeIndex + 3) / 4;
            const leftLinesCount = rightLinesCount - 1;
            const upLinesCount = leftLinesCount;
            const downLinesCount = upLinesCount;

            splashCell = setStaticCell(rightLinesCount, upLinesCount, leftLinesCount, downLinesCount, i, j);

            if (currentRange - splashStep + leftLinesCount <= j && i === upLinesCount) {
              splashCell = !defaultSplashCell;
            }

            break;
          }
          case 2: case 6: case 10: case 14: case 18: { // down
            const rightLinesCount = (currentRangeIndex + 2) / 4;
            const leftLinesCount = rightLinesCount - 1;
            const upLinesCount = rightLinesCount;
            const downLinesCount = upLinesCount - 1;

            splashCell = setStaticCell(rightLinesCount, upLinesCount, leftLinesCount, downLinesCount, i, j);

            if (splashStep - ranges[currentRangeIndex - 1] + downLinesCount >= i && j === leftLinesCount) {
              splashCell = !defaultSplashCell;
            }

            break;
          }
          case 3: case 7: case 11: case 15: { // right
            const rightLinesCount = (currentRangeIndex + 1) / 4;
            const leftLinesCount = rightLinesCount;
            const upLinesCount = rightLinesCount;
            const downLinesCount = upLinesCount - 1;

            splashCell = setStaticCell(rightLinesCount, upLinesCount, leftLinesCount, downLinesCount, i, j);

            if (splashStep - ranges[currentRangeIndex - 1] + downLinesCount >= j && i === Game.#ROW_LENGTH - 1 - downLinesCount) {
              splashCell = !defaultSplashCell;
            }

            break;
          }

          default: {
            break;
          }
        }

        return splashCell;
      }),
    );
  };

  #printSplash = (callback) => {
    const allSplashSteps = Game.#ROW_LENGTH * Game.#COLUMN_LENGTH;
    let splashStep = 0;

    const printCallback = (defaultSplashCell) => {
      let strField = '';
      const currentSplashStep = splashStep > allSplashSteps
        ? splashStep - allSplashSteps
        : splashStep;
      const splashAnimation = this.#getAnimation(currentSplashStep, defaultSplashCell);

      for (let i = 0; i < Game.#ROW_LENGTH; i++) {
        for (let j = 0; j < Game.#COLUMN_LENGTH; j++) {
          strField += this.#getCell(Game.#SPLASH_SCREEN[i][j] || splashAnimation[i][j]);
        }
        strField += '\n';
      }

      this.gameElem.innerHTML = strField;
    }

    const intervalId = setInterval(() => {
      printCallback(splashStep > allSplashSteps);
      splashStep++;

      if (!this.#isGameOn) {
        clearInterval(intervalId);
      }

      if (splashStep === allSplashSteps * 2) {
        clearInterval(intervalId);
        callback();
      }
    }, Game.#SPLASH_DELAY);
  }

  #printField = () => {
    const field = this.#field;
    const figureField = this.#figureField;

    let strField = '';

    for (let i = 0; i < Game.#ROW_LENGTH; i++) {
      for (let j = 0; j < Game.#COLUMN_LENGTH; j++) {
        strField += this.#getCell(field[i][j] || figureField[i][j]);
      }
      strField += '\n';
    }

    this.gameElem.innerHTML = strField;
  };

  #checkEndGame = () => {
    let rowFilledCount = 0;
    const field = this.#field;

    for (let i = 0; i < Game.#ROW_LENGTH; i++) {
      if (field[i].some(elem => elem)) {
        rowFilledCount++;
      }
    }

    return rowFilledCount === Game.#ROW_LENGTH || rowFilledCount === 0;
  };

  #mergeFields = () => {
    let rowCount = 0;

    const newField = [];
    const field = this.#field;
    const figureField = this.#figureField;

    for (let i = 0; i < Game.#ROW_LENGTH; i++) {
      let row = [];
      for (let j = 0; j < Game.#COLUMN_LENGTH; j++) {
        row[j] = field[i][j] || figureField[i][j];
      }
      if (!row.every(elem => elem)) {
        newField[rowCount] = row;
        rowCount++;
      }
    }

    const rowDiff = field.length - newField.length;
    let newItems = [];

    if (rowDiff) {
      newItems = [...Array(rowDiff)].map(
        row => [...Array(Game.#COLUMN_LENGTH)].map(column => false)
      );
      this.#scores += Game.#SCORES_LEVEL[rowDiff];
    }

    this.#field = [...newItems, ...newField];
  }

  #getMaxPosition = (currentFigure) => {
    let maxPosition = 0;

    for (let i = 0; i < currentFigure.length; i++) {
      for (let j = 0; j < currentFigure[0].length; j++) {
        if (currentFigure[i][j] && (j + 1) > maxPosition) {
          maxPosition = j + 1;
        }
      }
    }

    return maxPosition;
  };

  #setFigureField = (currentStep) => {
    this.#figureField = [...Array(Game.#ROW_LENGTH)].map(
      (_, row) => [...Array(Game.#COLUMN_LENGTH)].map((_, column) => {
        const rowDiff = currentStep - row;
        const figureRows = this.#figure.length;
        const figureColumns = this.#figure[0].length;

        if (rowDiff < figureRows) {
          const columnDiff = column - this.#currentPositionX;
          const figureRow = this.#figure[figureRows - 1 - rowDiff];

          return (columnDiff >= 0 && columnDiff < figureColumns && figureRow)
            ? figureRow[columnDiff]
            : false;
        }

        return false;
      })
    );

    this.#printField();
  };

  #isFieldBottomTouch = () => {
    const figureRows = this.#figure.length;

    for (let i = 0; i < figureRows; i++) {
      for (let j = 0; j < this.#figure[i].length; j++) {
        const currentCell = this.#figure[i][j];

        if (!currentCell) continue;

        if (this.#step >= Game.#ROW_LENGTH) return true;

        const fieldRow = this.#field[this.#step - figureRows + 1 + i];

        if (fieldRow && fieldRow[this.#currentPositionX + j]) {
          return true;
        }
      }
    }

    return false;
  };

  #isFieldLeftTouch = () => {
    const figureRows = this.#figure.length;

    for (let i = 0; i < figureRows; i++) {
      for (let j = 0; j < this.#figure[i].length; j++) {
        const currentCell = this.#figure[i][j];

        if (!currentCell) continue;

        const fieldRow = this.#field[this.#step - figureRows + i];

        if (fieldRow && fieldRow[this.#currentPositionX + j - 1]) {
          return true;
        }

        break;
      }
    }

    return false;
  };

  #isFieldRightTouch = () => {
    const figureRows = this.#figure.length;

    for (let i = 0; i < figureRows; i++) {
      for (let j = this.#figure[i].length -1; j >= 0; j--) {
        const currentCell = this.#figure[i][j];

        if (!currentCell) continue;

        const fieldRow = this.#field[this.#step - figureRows + i];

        if (fieldRow && fieldRow[this.#currentPositionX + j + 1]) {
          return true;
        }

        break;
      }
    }

    return false;
  };

  moveFigureLeft = () => {
    if (!this.#isGameInProgress) return;

    const minPosition = 0;
    if (!this.#isFieldLeftTouch()) {
      this.#currentPositionX = this.#currentPositionX <= minPosition
        ? minPosition
        : this.#currentPositionX - 1;
    }
    this.#setFigureField(this.#step - 1);
  };

  moveFigureRight = () => {
    if (!this.#isGameInProgress) return;

    const maxPosition = Game.#COLUMN_LENGTH - this.#getMaxPosition(this.#figure);
    if (!this.#isFieldRightTouch()) {
      this.#currentPositionX = this.#currentPositionX >= maxPosition
        ? maxPosition
        : this.#currentPositionX + 1;
    }
    this.#setFigureField(this.#step - 1);
  };

  moveFigureDown = () => {
    if (!this.#isGameInProgress) return;

    this.#currentDelay = Game.#SPEED_DELAY;
    this.#clearCurrentTimeout();
    this.continue();
  };

  stopMovingFigureDown = () => {
    if (!this.#isGameInProgress) return;

    this.#currentDelay = this.#delay;
  };

  moveFigureDownQuickly = () => {
    if (!this.#isGameInProgress) return;

    this.#currentDelay = Game.#MIN_DELAY;
    this.#clearCurrentTimeout();
    this.continue();
  };

  rotateFigure = () => {
    if (!this.#isGameInProgress) return;

    const newFigure = [];
    const figureRows = this.#figure.length;
    const figureColumns = this.#figure[0].length;

    for (let i = 0; i < figureRows; i++) {
      for (let j = 0; j < figureColumns; j++) {
        if (!newFigure[j]) {
          newFigure[j] = [];
        }

        newFigure[j][figureRows - 1 - i] = this.#figure[i][j];
      }
    }

    const nextStep = this.#step - (figureRows - newFigure.length);
    this.#step = nextStep < Game.#ROW_LENGTH ? nextStep : Game.#ROW_LENGTH;

    const nextPosition = this.#currentPositionX - (figureColumns - newFigure[0].length);
    const maxPosition = Game.#COLUMN_LENGTH - this.#getMaxPosition(newFigure);
    if (nextPosition >= maxPosition) {
      this.#currentPositionX = maxPosition;
    } else if (nextPosition <= 0) {
      this.#currentPositionX = 0;
    }

    this.#figure = newFigure;
    this.#setFigureField(this.#step - 1);
  };

  continue = () => {
    if (!this.#isGameInProgress) return;

    let isGameEnd = false;

    if (this.#step === 0) {
      this.#figure = this.#getRandomFigure();
      this.#figuresCount++;
      this.#figureField = Game.#EMPTY_FIELD;
      this.#changeDelay();
    }

    if (this.#isFieldBottomTouch()) {
      this.#mergeFields();
      isGameEnd = this.#checkEndGame();

      if (isGameEnd) {
        if (this.#scores > localStorage.getItem(Game.#HI_SCORE_LABEL)) {
          localStorage.setItem(Game.#HI_SCORE_LABEL, this.#scores);
        }
        this.#clearCurrentTimeout();
      } else {
        this.scoresElem.innerText = this.#scores;

        if (this.#currentDelay === Game.#MIN_DELAY) {
          this.#currentDelay = this.#delay;
        }

        this.#step = 0;
        this.#currentPositionX = Game.#START_POSITION_X;
      }
    } else {
      this.#setFigureField(this.#step);
      this.#step++;
    }

    if (!isGameEnd) {
      this.#currentTimeoutId = setTimeout(this.continue, this.#currentDelay);
    }
  };

  start = () => {
    this.continue();
  }

  reset = () => {
    this.#clearCurrentTimeout();

    this.#scores = 0;
    this.#figuresCount = 0;
    this.#step = 0;
    this.#currentPositionX = Game.#START_POSITION_X;

    this.#currentTimeoutId = 0;
    this.#delay = Game.#START_DELAY;
    this.#currentDelay = this.#delay;

    this.#field = Game.#EMPTY_FIELD;
    this.#figure = null;
    this.#figureField = Game.#EMPTY_FIELD;

    this.scoresElem.innerText = this.#scores;

    this.#isGameInProgress = true;

    this.start();
  }

  togglePause = () => {
    this.#isGameInProgress = !this.#isGameInProgress;

    if (this.#isGameInProgress) {
      this.continue();
    }
  }

  toggleOn = () => {
    this.gameElem.classList.toggle('invisible');
    this.gameInfoElem.classList.toggle('invisible');

    this.#isGameOn = !this.#isGameOn;

    if (this.#isGameOn) {
      this.#printSplash(() => {
        this.#isGameInProgress = true;
        this.reset();
      });
    } else {
      this.#isGameInProgress = false;
    }
  }
};

const gameElem = document.getElementById('game');
const gameInfoElem = document.getElementById('game-info');
const scoresElem = document.getElementById('score');
const hiScoresElem = document.getElementById('hi-score');

const game = new Game(gameElem, gameInfoElem, scoresElem, hiScoresElem);

const KEY_LEFT_ARROW = 'ArrowLeft';
const KEY_UP_ARROW = 'ArrowUp';
const KEY_RIGHT_ARROW = 'ArrowRight';
const KEY_DOWN_ARROW = 'ArrowDown';
const KEY_SPACE = 'Space';

document.addEventListener('keydown', (e) => {
  const event = e || window.event;
  const code = event.code;

  if (code === KEY_LEFT_ARROW) {
    game.moveFigureLeft();
  } else if (code == KEY_RIGHT_ARROW) {
    game.moveFigureRight();
  } else if (code === KEY_DOWN_ARROW) {
    game.moveFigureDown();
  } else if (code === KEY_UP_ARROW) {
    game.rotateFigure();
  } else if (code === KEY_SPACE) {
    game.moveFigureDownQuickly();
  }
});

document.addEventListener('keyup', (e) => {
  const event = e || window.event;
  const code = event.code;

  if (code === KEY_DOWN_ARROW) {
    game.stopMovingFigureDown();
  }
});

document.getElementById('button-game-on').addEventListener('click', game.toggleOn);
document.getElementById('button-game-pause').addEventListener('click', game.togglePause);
document.getElementById('button-game-reset').addEventListener('click', game.reset);

document.getElementById('button-left').addEventListener('click', game.moveFigureLeft);
document.getElementById('button-right').addEventListener('click', game.moveFigureRight);
document.getElementById('button-up').addEventListener('click', game.moveFigureDownQuickly);
document.getElementById('button-down').addEventListener('onmousedown', game.moveFigureDown);
document.getElementById('button-down').addEventListener('onmouseup', game.stopMovingFigureDown);
document.getElementById('button-rotate').addEventListener('click', game.rotateFigure);
