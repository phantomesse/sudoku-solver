// requires: cell.js

function solve(cells: Cell[][]) {
  // Get how many of each number we still need.
  let numberCounts: Map<number, number> = new Map();
  for (let i = 1; i <= 9; i++) {
    numberCounts.set(i, 9);
  }
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells.length; j++) {
      let number = cells[i][j].number;
      if (number === undefined) continue;
      numberCounts.set(number, numberCounts.get(number) - 1);
    }
  }

  // Split cells into regions.
  let regions: _Region[] = [];
  let regionIndex = 0;
  for (let i = 0; i < cells.length; i += 3) {
    for (let j = 0; j < cells[i].length; j += 3) {
      let region = new _Region(regionIndex++, [
        [cells[i][j], cells[i][j + 1], cells[i][j + 2]],
        [cells[i + 1][j], cells[i + 1][j + 1], cells[i + 1][j + 2]],
        [cells[i + 2][j], cells[i + 2][j + 1], cells[i + 2][j + 2]]
      ]);
      regions.push(region);
    }
  }

  // Split cells into columns and rows.
  let columns: _Line[] = [];
  let rows: _Line[] = [];
  for (let i = 0; i < cells.length; i++) {
    let columnCells = [];
    let rowCells = [];
    for (let j = 0; j < cells.length; j++) {
      columnCells.push(cells[j][i]);
      rowCells.push(cells[i][j]);
    }
    columns.push(new _Line(columnCells));
    rows.push(new _Line(rowCells));
  }

  while (numberCounts.size > 0) {
    for (let number of numberCounts.keys()) {
      if (numberCounts.get(number) === 0) {
        numberCounts.delete(number);
        continue;
      }

      let regionsWithoutNumber = regions.filter(
        region => !region.hasNumber(number)
      );
      for (let region of regionsWithoutNumber) {
        let availableCells = region.getAvailableCells();
        let potentialCells = [];
        for (let cell of availableCells) {
          if (
            !rows[cell.x].hasNumber(number) &&
            !columns[cell.y].hasNumber(number)
          ) {
            cell.guesses.push(number);
            potentialCells.push(cell);
          }
        }
        if (potentialCells.length === 1) {
          potentialCells[0].number = number;
          potentialCells[0].render();
          numberCounts.set(number, numberCounts.get(number) - 1);
        }
      }
    }
  }
}

class _Region {
  readonly regionIndex: number;
  readonly cells: Cell[][];

  constructor(regionIndex: number, cells: Cell[][]) {
    this.regionIndex = regionIndex;
    this.cells = cells;
  }

  hasNumber(number: number): boolean {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        if (this.cells[i][j].number === number) return true;
      }
    }
    return false;
  }

  getRowAndColumn(
    number: number
  ): { row: _RowPosition; column: _ColumnPosition } {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        if (this.cells[i][j].number === number) {
          return {
            row: i,
            column: j
          };
        }
      }
    }
    return undefined;
  }

  getAvailableCells(): Cell[] {
    let cells = [];
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        if (this.cells[i][j].number === undefined) {
          cells.push(this.cells[i][j]);
        }
      }
    }
    return cells;
  }
}

class _Line {
  readonly cells: Cell[];

  constructor(cells: Cell[]) {
    this.cells = cells;
  }

  hasNumber(number: number): boolean {
    for (let cell of this.cells) {
      if (cell.number === number) return true;
    }
    return false;
  }
}

enum _RowPosition {
  Top = 0,
  Middle = 1,
  Bottom = 2
}

enum _ColumnPosition {
  Left = 0,
  Middle = 1,
  Right = 2
}
