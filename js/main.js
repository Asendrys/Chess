"use strict";
let playerview = Color.White; //temp
function switchView() {
    playerview = otherColor(playerview);
    update();
}
const game = new Game();
function init() {
    update();
    // const otherBoard : Board = game.board.copy();
    // boardMovePiece(otherBoard, 2, 1, 4, 4); 
    // update();
}
function update() {
    updateView();
    updateCaptures();
}
