"use strict";
const opponentCaptures = document.querySelector("#opponentCaptures");
const yourCaptures = document.querySelector("#yourCaptures");
function prevDef(event) {
    event.preventDefault();
}
opponentCaptures.oncontextmenu = prevDef;
yourCaptures.oncontextmenu = prevDef;
const Cwidth = yourCaptures.width;
const Cheight = yourCaptures.height;
const Csize = Cheight;
const ctxY = yourCaptures.getContext("2d");
const ctxO = opponentCaptures.getContext("2d");
function drawPiecePos(color, pieceType, index, context) {
    context.drawImage(getImage(color, pieceType), index * Csize, 0, Csize, Csize);
}
function clearCanvas(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}
function displayCaptures(game, color, playerView) {
    const contextYour = (playerView === color) ? ctxY : ctxO;
    const contextOpp = (playerView === otherColor(color)) ? ctxO : ctxY;
    switch (color) {
        case Color.Black:
            for (let i = 0; i < game.blackCaptures.length; i++) {
                drawPiecePos(game.blackCaptures[i].color, game.blackCaptures[i].type, i, contextYour);
            }
            break;
        case Color.White:
            for (let i = 0; i < game.whiteCaptures.length; i++) {
                drawPiecePos(game.whiteCaptures[i].color, game.whiteCaptures[i].type, i, contextOpp);
            }
            break;
        default:
            throw new Error("unreachable");
    }
}
function updateCaptures() {
    clearCanvas(yourCaptures, ctxY);
    clearCanvas(opponentCaptures, ctxO);
    displayCaptures(game, playerview, playerview);
    displayCaptures(game, otherColor(playerview), playerview);
}
