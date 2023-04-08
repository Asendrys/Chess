"use strict";
const getCell = (playerColor, mouseX, mouseY) => {
    const rect = canvas.getBoundingClientRect();
    const xval = Math.floor((mouseX - rect.x) / squareSize);
    const yval = Math.floor((mouseY - rect.y) / squareSize);
    switch (playerColor) {
        case Color.White:
            return {
                x: xval,
                y: yval,
            };
        case Color.Black:
            return {
                x: 7 - xval,
                y: 7 - yval,
            };
        default:
            throw new Error("unreachable");
    }
};
const clickdown = (event) => {
    event.preventDefault();
    if (event.button === 0) { //Only left click
        const cell_coords = getCell(playerview, event.clientX, event.clientY);
        game.select(game.board[cell_coords.y][cell_coords.x]);
        availableCells(game, cell_coords.x, cell_coords.y).forEach(cell => {
            if (inBoundaries(cell.x, cell.y))
                game.board[cell.y][cell.x].available = true;
        });
    }
    update();
};
const clickup = (event) => {
    var _a, _b;
    event.preventDefault();
    const cell_coords = getCell(playerview, event.clientX, event.clientY);
    if (event.button === 0 && game.selecting && (((_a = game.selectedCell) === null || _a === void 0 ? void 0 : _a.x) !== cell_coords.x || ((_b = game.selectedCell) === null || _b === void 0 ? void 0 : _b.y) !== cell_coords.y)) {
        const cell = game.selectedCell;
        movePiece(game, cell.x, cell.y, cell_coords.x, cell_coords.y);
    }
    else if (event.button === 2) {
        game.board[cell_coords.y][cell_coords.x].marked = !(game.board[cell_coords.y][cell_coords.x].marked);
    }
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            game.board[row][col].available = false;
        }
    }
    game.unselect();
    update();
};
canvas.addEventListener('mousedown', clickdown);
// canvas.addEventListener('touchdown', clickdown)
canvas.addEventListener('mouseup', clickup);
// canvas.addEventListener('touchup', clickup)
