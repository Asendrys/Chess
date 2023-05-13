let playerview : Color = Color.White; //temp

function switchView() : void {
    playerview = otherColor(playerview);
    update();
}

const game : Game = new Game();

function init() : void {
    update();

    // const otherBoard : Board = game.board.copy();
    // boardMovePiece(otherBoard, 2, 1, 4, 4); 
    // update();
}

function update() : void {
    updateView();
    updateCaptures();
}