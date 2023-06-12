class Game {
  static #DEBUG = window.location.search.includes('debug');
  static #ROW_LENGTH = 20;
  static #COLUMN_LENGTH = 10;
  static #START_COLUMN = 3;

  static #FIGURES = {
    // I
    0: [
      [true, true, true, true]
    ],
    // L
    1: [
      [true, false, false],
      [true, true, true]
    ],
    // J
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
  static #FIGURES_ROTATION = {
    0: [{
      row: -2,
      column: 1,
    }, {
      row: 1,
      column: -1,
    }, {
      row: -1,
      column: 2,
    }, {
      row: 2,
      column: -2,
    }],
    1: [{
      row: -1,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 1,
    }, {
      row: 1,
      column: -1,
    }],
    2: [{
      row: -1,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 1,
    }, {
      row: 1,
      column: -1,
    }],
    3: [{
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }],
    4: [{
      row: -1,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 1,
    }, {
      row: 1,
      column: -1,
    }],
    5: [{
      row: -1,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 1,
    }, {
      row: 1,
      column: -1,
    }],
    6: [{
      row: -1,
      column: 0,
    }, {
      row: 0,
      column: 0,
    }, {
      row: 0,
      column: 1,
    }, {
      row: 1,
      column: -1,
    }],
  };
  static #FIGURES_COUNT = 7;
  static #FIGURE_MAX_HEIGHT = 4;
  static #CHANGE_DELAY_INTERVAl = 10;

  static #START_DELAY = Game.#DEBUG ? 5000 : 1000;
  static #DIFF_DELAY = 50;
  static #SPEED_DELAY = 100;
  static #MIN_DELAY = 0;
  static #SPLASH_DELAY = 20;

  static #CELL = '▣';
  static #HI_SCORE_LABEL = 'hi-score';
  static #HI_SCORE = localStorage.getItem(Game.#HI_SCORE_LABEL);

  static #AUDIO = new Audio('./sound/korobeyniki.mp3');

  static #SCORES_LEVEL = {
    0: 0,
    1: 100,
    2: 300,
    3: 700,
    4: 1500,
  };

  static #EMPTY_FIELD = [...Array(Game.#ROW_LENGTH)].map(
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
  #currentRow = 0;
  #currentColumn = Game.#START_COLUMN;
  #rotations = 0;

  #currentTimeoutId = 0;
  #delay = Game.#START_DELAY;
  #currentDelay = this.#delay;

  #figure = null;
  #figureIndex = null;
  #nextFigure = null;
  #nextFigureIndex = null;
  #field = Game.#EMPTY_FIELD;
  #figureField = Game.#EMPTY_FIELD;

  #isGameInProgress = false;
  #isGameOn = false;
  #isSoundOn = false;

  #moveLeftButtonInterval = 0;
  #moveRightButtonInterval = 0;

  constructor(gameElem, gameInfoElem) {
    this.gameElem = gameElem;
    this.gameInfoElem = gameInfoElem;

    this.gameInfoElem.innerHTML = `
      <div class="score-text">Hi-Score</div>
      <div id="hi-score">0</div>
      <div class="score-text">Score</div>
      <div id="score">0</div>
      <div id="next-figure"></div>
      <div class="score-text">Speed</div>
      <div id="speed">1</div>
      <div id="paused" class="invisible blinking">PAUSED</div>
    `;

    this.scoresElem = document.getElementById('score');
    this.hiScoresElem = document.getElementById('hi-score');
    this.nextFigureElem = document.getElementById('next-figure');
    this.speedElem = document.getElementById('speed');
    this.pausedElem = document.getElementById('paused');

    this.#setHiScore();

    Game.#AUDIO.loop = true;
    Game.#AUDIO.volume = 0.5;
  };

  #setHiScore = () => {
    this.hiScoresElem.innerText = Game.#HI_SCORE || 0;
  };

  #clearCurrentTimeout = () => {
    clearTimeout(this.#currentTimeoutId);
  };

  #changeDelay = () => {
    if (this.#figuresCount % Game.#CHANGE_DELAY_INTERVAl === 0) {
      this.#delay = this.#delay - Game.#DIFF_DELAY > Game.#SPEED_DELAY
        ? this.#delay - Game.#DIFF_DELAY
        : Game.#SPEED_DELAY;
      this.speedElem.innerText = Math.round(this.#figuresCount / Game.#CHANGE_DELAY_INTERVAl);
    }
  };

  #getRandomFigure = () => {
    const rand = Math.round(Math.random() * Game.#FIGURES_COUNT - 0.5);
    this.#nextFigureIndex = rand;
    return Game.#FIGURES[rand];
  };

  #getCell = (val) => `<span class="cell ${val ? 'filled' : 'empty'}">${Game.#CELL}</span>`;

  #getStrField = (field1, field2) => {
    let strField = '';

    for (let i = 0; i < Game.#ROW_LENGTH; i++) {
      for (let j = 0; j < Game.#COLUMN_LENGTH; j++) {
        strField += this.#getCell(field1[i][j] || field2[i][j]);
      }
    }

    return strField;
  };

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
      const currentSplashStep = splashStep > allSplashSteps - 1
        ? splashStep - allSplashSteps
        : splashStep;
      const splashAnimation = this.#getAnimation(currentSplashStep, defaultSplashCell);

      this.gameElem.innerHTML = this.#getStrField(Game.#SPLASH_SCREEN, splashAnimation);
    }

    const intervalId = setInterval(() => {
      printCallback(splashStep > allSplashSteps);
      splashStep++;

      if (!this.#isGameOn) {
        clearInterval(intervalId);
      }

      if (splashStep === allSplashSteps * 2 - 1) {
        clearInterval(intervalId);
        callback();
      }
    }, Game.#SPLASH_DELAY);
  }

  #printField = () => {
    this.gameElem.innerHTML = this.#getStrField(this.#field, this.#figureField);
  };

  #printNextFigure = () => {
    const nextFigure = this.#nextFigure;

    let strField = '';

    for (let i = 0; i < Game.#FIGURE_MAX_HEIGHT; i++) {
      for (let j = 0; j < Game.#FIGURE_MAX_HEIGHT; j++) {
        strField += this.#getCell(nextFigure && nextFigure[i] && nextFigure[i][j]);
      }
    }

    this.nextFigureElem.innerHTML = strField;
  };

  #checkEndGame = () => {
    const field = this.#field;
    let rowFilledCount = 0;

    for (let i = 0; i < Game.#ROW_LENGTH; i++) {
      if (field[i].some(elem => elem)) {
        rowFilledCount++;
      }
    }

    return rowFilledCount === Game.#ROW_LENGTH;
  };

  #mergeFields = () => {
    const newField = [];
    const field = this.#field;
    const figureField = this.#figureField;

    let rowCount = 0;

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
    let emptyField = [];

    if (rowDiff) {
      emptyField = [...Array(rowDiff)].map(
        row => [...Array(Game.#COLUMN_LENGTH)].map(column => false)
      );
      this.#scores += Game.#SCORES_LEVEL[rowDiff];
    }

    this.#field = [...emptyField, ...newField];
  };

  #getMaxColumn = (
    currentFigure,
    currentRow = this.#currentRow,
    currentColumn = this.#currentColumn,
  ) => {
    const figureRows = currentFigure.length;
    const figureColumns = currentFigure[0].length;

    let maxColumn = Game.#COLUMN_LENGTH - figureColumns;

    for (let i = 0; i < figureRows; i++) {
      let prevFilledColumn = -1;

      for (let j = figureColumns - 1; j >= 0; j--) {
        if (!currentFigure[i][j] || j < prevFilledColumn) continue;

        prevFilledColumn = j;

        const fieldColumnIndex = currentRow + i >= 0
          ? this.#field[currentRow + i]
            .findIndex((elem, index) => {
              return (index > currentColumn) && elem;
            })
          : -1;

        if (fieldColumnIndex !== -1 && fieldColumnIndex - j - 1 < maxColumn) {
          maxColumn = fieldColumnIndex - j - 1;
        }
      }
    }

    return maxColumn;
  };

  #getMinColumn = (
    currentFigure,
    currentRow = this.#currentRow,
    currentColumn = this.#currentColumn,
  ) => {
    const figureRows = currentFigure.length;
    const figureColumns = currentFigure[0].length;

    let minColumn = 0;

    for (let i = 0; i < figureRows; i++) {
      let prevFilledColumn = figureColumns;

      for (let j = 0; j < figureColumns; j++) {
        if (!currentFigure[i][j] || j > prevFilledColumn) continue;

        prevFilledColumn = j;

        const fieldColumnIndex = currentRow + i >= 0
          ? this.#field[currentRow + i]
            .findLastIndex((elem, index) => {
              return (index < currentColumn + figureColumns) && elem;
            })
          : -1;

        if (fieldColumnIndex !== -1 && fieldColumnIndex - j + 1 > minColumn) {
          minColumn = fieldColumnIndex - j + 1;
        }
      }
    }

    return minColumn;
  };

  #getMaxRow = (
    currentFigure,
    currentRow = this.#currentRow,
    currentColumn = this.#currentColumn,
  ) => {
    const figureRows = currentFigure.length;
    const figureColumns = currentFigure[0].length;

    let maxRow = Game.#ROW_LENGTH - figureRows;

    for (let j = 0; j < figureColumns; j++) {
      let prevFilledRow = -1;

      for (let i = figureRows - 1; i >= 0; i--) {
        if (!currentFigure[i][j] || i < prevFilledRow) continue;

        prevFilledRow = i;

        const fieldColumn = this.#field.map(row => row[currentColumn + j]);
        const fieldRowIndex = fieldColumn
          .findIndex((elem, index) => {
            return (index > currentRow) && elem;
          });

        if (fieldRowIndex !== -1 && fieldRowIndex - i - 1 < maxRow) {
          maxRow = fieldRowIndex - i - 1;
        }
      }
    }

    return maxRow;
  };

  #getMinRow = (
    currentFigure,
    currentRow = this.#currentRow,
    currentColumn = this.#currentColumn,
  ) => {
    const figureRows = currentFigure.length;
    const figureColumns = currentFigure[0].length;

    let minRow = 0;

    for (let i = 0; i < figureRows; i++) {
      let prevFilledRow = figureRows;

      for (let j = 0; j < figureColumns; j++) {
        if (!currentFigure[i][j] || i > prevFilledRow) continue;

        prevFilledRow = i;

        const fieldColumn = this.#field.map(row => row[currentColumn + j]);
        const fieldRowIndex = fieldColumn
          .findLastIndex((elem, index) => {
            return (index < currentRow + figureRows) && elem;
          })

        if (fieldRowIndex !== -1 && fieldRowIndex + i + 1 > minRow) {
          minRow = fieldRowIndex + i + 1;
        }
      }
    }

    return minRow;
  };

  #getNextPosition = (currentFigure) => {
    const { row, column } = Game.#FIGURES_ROTATION[this.#figureIndex][this.#rotations % 4];

    let nextRow = this.#currentRow + row < 0 ? 0 : this.#currentRow + row;
    let nextColumn = this.#currentColumn + column < 0 ? 0 : this.#currentColumn + column;

    const maxRow = this.#getMaxRow(currentFigure, nextRow, nextColumn);
    const minRow = this.#getMinRow(currentFigure, nextRow, nextColumn);

    const maxColumn = this.#getMaxColumn(currentFigure, nextRow, nextColumn);
    const minColumn = this.#getMinColumn(currentFigure, nextRow, nextColumn);

    if (minRow > maxRow) {
      nextRow = -1;
    } else if (nextRow >= maxRow) {
      nextRow = maxRow;
    } else if (nextRow <= minRow) {
      nextRow = minRow;
    }

    if (minColumn > maxColumn) {
      nextColumn = -1;
    } else if (nextColumn >= maxColumn) {
      nextColumn = maxColumn;
    } else if (nextColumn <= minColumn) {
      nextColumn = minColumn;
    }

    return {
      nextRow,
      nextColumn,
    };
  };

  #setFigureField = () => {
    this.#figureField = [...Array(Game.#ROW_LENGTH)].map(
      (_, row) => [...Array(Game.#COLUMN_LENGTH)].map((_, column) => {
        const figureRows = this.#figure.length;
        const figureColumns = this.#figure[0].length;

        if (row < this.#currentRow
          || row >= this.#currentRow + figureRows
          || column < this.#currentColumn
          || column >= this.#currentColumn + figureColumns
        ) {
          return false;
        }

        return this.#figure[row - this.#currentRow][column - this.#currentColumn];
      }),
    );

    this.#printField();
  };

  moveFigureLeft = () => {
    if (!this.#isGameInProgress) return;

    const minColumn = this.#getMinColumn(this.#figure);
    this.#currentColumn = this.#currentColumn <= minColumn
      ? minColumn
      : this.#currentColumn - 1;

    this.#setFigureField();
  };

  moveFigureRight = () => {
    if (!this.#isGameInProgress) return;

    const maxColumn = this.#getMaxColumn(this.#figure);
    this.#currentColumn = this.#currentColumn >= maxColumn
      ? maxColumn
      : this.#currentColumn + 1;

    this.#setFigureField();
  };

  moveFigureDown = (e) => {
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

  onMoveLeftButtonMouseDown = (e) => {
    this.#moveLeftButtonInterval = setInterval(() => {
      this.moveFigureLeft();
    }, 50);
    e.preventDefault();
  };

  onMoveLeftButtonMouseUp = () => {
    clearInterval(this.#moveLeftButtonInterval);
  };

  onMoveRightButtonMouseDown = (e) => {
    this.#moveRightButtonInterval = setInterval(() => {
      this.moveFigureRight();
    }, 50);
    e.preventDefault();
  };

  onMoveRightButtonMouseUp = () => {
    clearInterval(this.#moveRightButtonInterval);
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

    const { nextRow, nextColumn } = this.#getNextPosition(newFigure);

    if (nextRow !== -1 && nextColumn !== -1) {
      this.#figure = newFigure;
      this.#currentRow = nextRow;
      this.#currentColumn = nextColumn;
      this.#rotations++;
      this.#setFigureField();
    }
  };

  continue = () => {
    if (!this.#isGameInProgress) return;

    let isGameEnd = false;

    const maxRow = this.#getMaxRow(this.#figure);
    this.#setFigureField();

    if (this.#currentRow >= maxRow) {
      this.#mergeFields();
      isGameEnd = this.#checkEndGame();

      if (isGameEnd) {
        if (this.#scores > Game.#HI_SCORE) {
          localStorage.setItem(Game.#HI_SCORE_LABEL, this.#scores);
          this.#setHiScore();
        }
        this.#clearCurrentTimeout();
        this.#isGameInProgress = false;
        alert(`Game over, your scores: ${this.#scores}`)
      } else {
        this.scoresElem.innerText = this.#scores;

        if (this.#currentDelay === Game.#MIN_DELAY) {
          this.#currentDelay = this.#delay;
        }

        this.#currentRow = 0;
        this.#currentColumn = Game.#START_COLUMN;

        this.#figure = this.#nextFigure;
        this.#figureIndex = this.#nextFigureIndex;
        this.#nextFigure = this.#getRandomFigure();

        this.#rotations = 0;
        this.#figuresCount++;
        this.#figureField = Game.#EMPTY_FIELD;

        this.#changeDelay();
        this.#printNextFigure();
      }
    } else {
      this.#currentRow++;
    }

    if (!isGameEnd) {
      this.#currentTimeoutId = setTimeout(this.continue, this.#currentDelay);
    }
  };

  start = () => {
    this.continue();
  };

  reset = () => {
    this.#clearCurrentTimeout();

    this.#scores = 0;
    this.#figuresCount = 0;
    this.#currentRow = 0;
    this.#currentColumn = Game.#START_COLUMN;

    this.#currentTimeoutId = 0;
    this.#delay = Game.#START_DELAY;
    this.#currentDelay = this.#delay;

    this.#field = Game.#EMPTY_FIELD;
    this.#figure = this.#getRandomFigure();
    this.#figureIndex = this.#nextFigureIndex;
    this.#nextFigure = this.#getRandomFigure();
    this.#figureField = Game.#EMPTY_FIELD;

    this.scoresElem.innerText = this.#scores;

    this.#isGameInProgress = true;
    document.getElementById('button-game-pause').classList.remove('inactive');
    this.pausedElem.classList.add('invisible');

    this.#printNextFigure();
    this.start();
  };

  togglePause = () => {
    if (!this.#isGameOn) return;

    this.#isGameInProgress = !this.#isGameInProgress;

    if (this.#isGameInProgress) {
      this.continue();
      this.pausedElem.classList.add('invisible');
    } else {
      this.pausedElem.classList.remove('invisible');
    }
  };

  toggleOn = () => {
    this.gameElem.classList.toggle('invisible');
    this.gameInfoElem.classList.toggle('invisible');
    const pauseButton = document.getElementById('button-game-pause');

    this.#isGameOn = !this.#isGameOn;

    if (this.#isGameOn) {
      if (Game.#DEBUG) {
        this.#isGameInProgress = true;
        this.reset();
      } else {
        this.#printSplash(() => {
          this.#isGameInProgress = true;
          this.reset();
        });
      }
    } else {
      this.#isGameInProgress = false;
      pauseButton.classList.add('inactive');
      this.pausedElem.classList.add('invisible');
      this.#isSoundOn = false;
      Game.#AUDIO.pause();
      Game.#AUDIO.currentTime = 0;
    }
  };

  toggleSound = () => {
    if (!this.#isGameOn) return;

    if (!this.#isSoundOn) {
      Game.#AUDIO.play();
    } else {
      Game.#AUDIO.pause();
    }

    this.#isSoundOn = !this.#isSoundOn;
  };
};

const gameElem = document.getElementById('game');
const gameInfoElem = document.getElementById('game-info');

const game = new Game(gameElem, gameInfoElem);

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
document.getElementById('button-game-sound').addEventListener('click', game.toggleSound);

document.getElementById('button-left').addEventListener('mousedown', game.onMoveLeftButtonMouseDown);
document.getElementById('button-left').addEventListener('mouseup', game.onMoveLeftButtonMouseUp);
document.getElementById('button-left').addEventListener('touchstart', game.onMoveLeftButtonMouseDown);
document.getElementById('button-left').addEventListener('touchend', game.onMoveLeftButtonMouseUp);

document.getElementById('button-right').addEventListener('mousedown', game.onMoveRightButtonMouseDown);
document.getElementById('button-right').addEventListener('mouseup', game.onMoveRightButtonMouseUp);
document.getElementById('button-right').addEventListener('touchstart', game.onMoveRightButtonMouseDown);
document.getElementById('button-right').addEventListener('touchend', game.onMoveRightButtonMouseUp);

document.getElementById('button-up').addEventListener('click', game.moveFigureDownQuickly);
document.getElementById('button-rotate').addEventListener('click', game.rotateFigure);

document.getElementById('button-down').addEventListener('mousedown', game.moveFigureDown);
document.getElementById('button-down').addEventListener('mouseup', game.stopMovingFigureDown);
document.getElementById('button-down').addEventListener('touchstart', game.moveFigureDown);
document.getElementById('button-down').addEventListener('touchend', game.stopMovingFigureDown);
