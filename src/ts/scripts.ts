// requires: board.js

let board = new Board();
board.loadGame('data/hard.txt').then(function() {
  board.solve();
});

document.getElementById('clear').onclick = function() {
  board.clear();
};

document.getElementById('solve').onclick = function() {
  board.solve();
};
