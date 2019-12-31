// requires: cell.js solve.js

class Board {
  private cells: Cell[][];

  constructor() {
    this.cells = [];
    let cellElements = document.getElementsByClassName('cell');
    for (let i = 0; i < cellElements.length; i++) {
      if (i % 9 === 0) this.cells.push([]);
      let rowIndex = ~~(i / 9);
      this.cells[rowIndex].push(
        new Cell(cellElements[i], rowIndex, this.cells[rowIndex].length)
      );
    }
  }

  public loadGame(filePath: string): Promise<void> {
    return new Promise(resolve => {
      let request = new XMLHttpRequest();
      request.open('GET', filePath, true);
      let self = this;
      request.onload = function() {
        let data = request.responseText.split('\n').map(row => row.split(''));
        for (let i = 0; i < self.cells.length; i++) {
          for (let j = 0; j < self.cells[i].length; j++) {
            let datum = data[i][j];
            let number = datum === '*' ? undefined : parseInt(datum, 10);
            let cell = self.cells[i][j];
            cell.number = number;
            cell.isPredefined = number === undefined;
            cell.render();
          }
        }
        resolve();
      };
      request.send();
    });
  }

  public clear() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        let cell = this.cells[i][j];
        cell.clear();
      }
    }
  }

  public solve() {
    solve(this.cells);
  }
}
