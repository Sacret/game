class Game {
  static #ROW_LENGTH = 20;
  static #COLUMN_LENGTH = 10;
  static #FIGURES_COUNT = 7;

  static #START_POSITION = 3;

  static #START_INTERVAL = 1000;
  static #DIFF_INTERVAL = 50;
  static #SPEED_INTERVAL = 100;
  static #MIN_INTERVAl = 0;

  static #CELL = '▣';

  static #SCORES_LEVEL = {
    0: 0,
    1: 100,
    2: 300,
    3: 700,
    4: 1500,
  };

  static #EMPTY_FIELD =  [...Array(Game.#ROW_LENGTH)].map(
    row => [...Array(Game.#COLUMN_LENGTH)].map(column => false)
  );

  static #FIGURES = {
    0: [
      [false, false, false, false],
      [true, true, true, true]
    ], // I
    1: [
      [true, false, false],
      [true, true, true]
    ], // J
    2: [
      [false, false, true],
      [true, true, true]
    ], // L
    3: [
      [true, true],
      [true, true]
    ], // O
    4: [
      [false, true, true],
      [true, true, false]
    ], // S
    5: [
      [false, true, false],
      [true, true, true]
    ], // T
    6: [
      [true, true, false],
      [false, true, true]
    ], // Z
  };

  #scores = 0;
  #figuresCount = 0;
  #currentTimeout = 0;
  #interval = Game.#START_INTERVAL;
  #currentInterval = this.#interval;
  #step = 0;
  #field = Game.#EMPTY_FIELD;
  #currentPosition = Game.#START_POSITION;
  #figure = null;
  #figureField = Game.#EMPTY_FIELD;

  constructor(gameElem, scoresElem, hiScoresElem) {
    this.gameElem = gameElem;
    this.scoresElem = scoresElem;
    this.hiScoresElem = hiScoresElem;

    this.#setHiScore();
  }

  #clearCurrentTimeout = () => {
    clearTimeout(this.#currentTimeout);
  }

  #setHiScore = () => {
    hiScoresElem.innerText = localStorage.getItem('hi-score') || 0;
  }

  #printField = () => {
    const field = this.#field;
    const figureField = this.#figureField;
    let strField = '';

    for (let i = 0; i < Game.#ROW_LENGTH; i++) {
      for (let j = 0; j < Game.#COLUMN_LENGTH; j++) {
        strField += (field[i][j] || figureField[i][j])
          ? `<span class="cell filled">${Game.#CELL}</span>`
          : `<span class="cell empty">${Game.#CELL}</span>`;
      }
      strField += '\n';
    }
    this.gameElem.innerHTML = strField;
  };

  #mergeFields = () => {
    let rowCount = 0;
    let rowFilledCount = 0;
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
      if (row.some(elem => elem)) {
        rowFilledCount++;
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

    const scores = this.#scores;

    if (rowFilledCount === Game.#ROW_LENGTH) {
      this.scoresElem.innerText = `You lost, ${scores}`;
      localStorage.setItem('hi-score', scores);
      this.#clearCurrentTimeout();
    } else if (rowFilledCount === 0) {
      this.scoresElem.innerText = `You win, ${scores}`;
      localStorage.setItem('hi-score', scores);
      this.#clearCurrentTimeout();
    } else {
      this.scoresElem.innerText = scores;
    }

    if (this.#currentInterval === Game.#MIN_INTERVAl) {
      this.#currentInterval = this.#interval;
    }

    this.#field = [...newItems, ...newField];
  }

  #getRandomFigure = () => {
    if (this.#figuresCount % 10 === 0) {
      this.#interval = this.#interval - Game.#DIFF_INTERVAL > Game.#SPEED_INTERVAL
        ? this.#interval - Game.#DIFF_INTERVAL
        : Game.#SPEED_INTERVAL;
    }
    this.#figuresCount++;

    let rand = Math.random() * Game.#FIGURES_COUNT - 0.5;
    return Game.#FIGURES[Math.round(rand)];
  };

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

  rotateFigure = () => {
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

    const nextPosition = this.#currentPosition - (figureColumns - newFigure[0].length);
    const maxPosition = Game.#COLUMN_LENGTH - this.#getMaxPosition(newFigure);
    if (nextPosition >= maxPosition) {
      this.#currentPosition = maxPosition;
    } else if (nextPosition <= 0) {
      this.#currentPosition = 0;
    }

    this.#figure = newFigure;
    this.#setFigureField(this.#step - 1);
  };

  #setFigureField = (currentStep) => {
    this.#figureField = [...Array(Game.#ROW_LENGTH)].map(
      (_, row) => [...Array(Game.#COLUMN_LENGTH)].map((_, column) => {
        const rowDiff = currentStep - row;
        const figureRows = this.#figure.length;
        const figureColumns = this.#figure[0].length;

        if (rowDiff < figureRows) {
          const columnDiff = column - this.#currentPosition;
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

        if (fieldRow && fieldRow[this.#currentPosition + j]) {
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

        if (fieldRow && fieldRow[this.#currentPosition + j - 1]) {
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

        if (fieldRow && fieldRow[this.#currentPosition + j + 1]) {
          return true;
        }

        break;
      }
    }

    return false;
  };

  moveFigureLeft = () => {
    const minPosition = 0;
    if (!this.#isFieldLeftTouch()) {
      this.#currentPosition = this.#currentPosition <= minPosition
        ? minPosition
        : this.#currentPosition - 1;
    }
    this.#setFigureField(this.#step - 1);
  };

  moveFigureRight = () => {
    const maxPosition = Game.#COLUMN_LENGTH - this.#getMaxPosition(this.#figure);
    if (!this.#isFieldRightTouch()) {
      this.#currentPosition = this.#currentPosition >= maxPosition
        ? maxPosition
        : this.#currentPosition + 1;
    }
    this.#setFigureField(this.#step - 1);
  };

  moveFigureDown = () => {
    this.#currentInterval = Game.#SPEED_INTERVAL;
    this.#clearCurrentTimeout();
    this.continueGame();
  };

  stopMovingFigureDown = () => {
    this.#currentInterval = this.#interval;
  };

  moveFigureDownQuickly = () => {
    this.#currentInterval = Game.#MIN_INTERVAl;
    this.#clearCurrentTimeout();
    this.continueGame();
  };

  continueGame = () => {
    if (this.#step === 0) {
      this.#figure = this.#getRandomFigure();
      this.#figureField = Game.#EMPTY_FIELD;
    }

    if (this.#isFieldBottomTouch()) {
      this.#mergeFields();
      this.#step = 0;
      this.#currentPosition = Game.#START_POSITION;
    } else {
      this.#setFigureField(this.#step);
      this.#step++;
    }

    this.#currentTimeout = setTimeout(this.continueGame, this.#currentInterval);
  };

  start = () => this.continueGame();
};

const gameElem = document.getElementById('game');
const scoresElem = document.getElementById('score');
const hiScoresElem = document.getElementById('hi-score');

const game = new Game(gameElem, scoresElem, hiScoresElem);
game.start();

const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;
const KEY_SPACE = 32;

document.addEventListener('keydown', (e) => {
  const event = e = e || window.event;
  const code = event.keyCode;

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
  const event = e = e || window.event;
  const code = event.keyCode;

  if (code === KEY_DOWN_ARROW) {
    game.stopMovingFigureDown();
  }
});

document.getElementById('button-left').addEventListener('click',  game.moveFigureLeft);
document.getElementById('button-right').addEventListener('click',  game.moveFigureRight);
document.getElementById('button-up').addEventListener('click',  game.moveFigureDownQuickly);
document.getElementById('button-down').addEventListener('onmousedown',  game.moveFigureDown);
document.getElementById('button-down').addEventListener('onmouseup',  game.stopMovingFigureDown);
document.getElementById('button-rotate').addEventListener('click',  game.rotateFigure);
