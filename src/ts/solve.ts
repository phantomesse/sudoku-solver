// requires: cell.js

async function solve(cells: Cell[][]) {
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

  let wasNumberCountsUpdated = false;
  while (numberCounts.size > 0) {
    wasNumberCountsUpdated = false;
    for (let number of numberCounts.keys()) {
      if (numberCounts.get(number) === 0) {
        numberCounts.delete(number);
        continue;
      }

      // Check regions.
      let regionsWithoutNumber = regions.filter(
        region => !region.hasNumber(number)
      );
      for (let region of regionsWithoutNumber) {
        let availableCells = region.getAvailableCells();
        let updated = _checkAvailableCells(
          number,
          availableCells,
          rows,
          columns,
          regions
        );
        if (updated) {
          numberCounts.set(number, numberCounts.get(number) - 1);
          wasNumberCountsUpdated = true;
        }
      }

      // Check columns.
      let columnsWithoutNumber = columns.filter(
        column => !column.hasNumber(number)
      );
      for (let column of columnsWithoutNumber) {
        let availableCells = column.getAvailableCells();
        let updated = _checkAvailableCells(
          number,
          availableCells,
          rows,
          columns,
          regions
        );
        if (updated) {
          numberCounts.set(number, numberCounts.get(number) - 1);
          wasNumberCountsUpdated = true;
        }
      }

      // Check rows.
      let rowsWithoutNumber = rows.filter(row => !row.hasNumber(number));
      for (let row of rowsWithoutNumber) {
        let availableCells = row.getAvailableCells();
        let updated = _checkAvailableCells(
          number,
          availableCells,
          rows,
          columns,
          regions
        );
        if (updated) {
          numberCounts.set(number, numberCounts.get(number) - 1);
          wasNumberCountsUpdated = true;
        }
      }
    }

    // Check if there's only one guess.
    for (let cell of cells.flat()) {
      if (cell.guesses.size === 1) {
        let number = cell.guesses.values().next().value;
        _updateCell(number, cell, rows, columns, regions);
        numberCounts.set(number, numberCounts.get(number) - 1);
        wasNumberCountsUpdated = true;
      }
      // await sleep(100);
    }

    if (!wasNumberCountsUpdated) break;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function _updateCell(
  number: number,
  cell: Cell,
  rows: _Line[],
  columns: _Line[],
  regions: _Region[]
) {
  for (let c of rows[cell.x].cells) {
    c.guesses.delete(number);
  }
  for (let c of columns[cell.y].cells) {
    c.guesses.delete(number);
  }
  for (let c of regions[cell.regionIndex].cells.flat()) {
    c.guesses.delete(number);
  }
  cell.number = number;
  cell.guesses.clear();
  cell.render();
}

// returns a boolean to indicate whether a new number has been added.
function _checkAvailableCells(
  number: number,
  availableCells: Cell[],
  rows: _Line[],
  columns: _Line[],
  regions: _Region[]
): boolean {
  if (availableCells.length === 1) {
    _updateCell(number, availableCells[0], rows, columns, regions);
    return true;
  }
  let potentialCells = [];
  for (let cell of availableCells) {
    if (
      !regions[cell.regionIndex].hasNumber(number) &&
      !rows[cell.x].hasNumber(number) &&
      !columns[cell.y].hasNumber(number)
    ) {
      cell.guesses.add(number);
      cell.render();
      potentialCells.push(cell);
    }
  }
  if (potentialCells.length === 1) {
    _updateCell(number, potentialCells[0], rows, columns, regions);
    return true;
  }
  return false;
}

class _Region {
  readonly regionIndex: number;
  readonly cells: Cell[][];

  constructor(regionIndex: number, cells: Cell[][]) {
    this.regionIndex = regionIndex;
    this.cells = cells;
    for (let cell of cells.flat()) {
      cell.regionIndex = regionIndex;
    }
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

  getAvailableCells(): Cell[] {
    return this.cells.filter(cell => cell.number === undefined);
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
