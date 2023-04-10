"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
canvas.addEventListener('mousedown', clickdown);
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const cell_coords = getCell(playerview, event.touches[0].clientX, event.touches[0].clientY);
    game.select(game.board[cell_coords.y][cell_coords.x]);
    availableCells(game, cell_coords.x, cell_coords.y).forEach(cell => {
        if (inBoundaries(cell.x, cell.y))
            game.board[cell.y][cell.x].available = true;
    });
    update();
});
canvas.addEventListener('mouseup', (event) => {
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
});
canvas.addEventListener('touchend', (event) => {
    var _a, _b;
    event.preventDefault();
    const cell_coords = getCell(playerview, event.touches[0].clientX, event.touches[0].clientY);
    if (game.selecting && (((_a = game.selectedCell) === null || _a === void 0 ? void 0 : _a.x) !== cell_coords.x || ((_b = game.selectedCell) === null || _b === void 0 ? void 0 : _b.y) !== cell_coords.y)) {
        const cell = game.selectedCell;
        movePiece(game, cell.x, cell.y, cell_coords.x, cell_coords.y);
    }
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            game.board[row][col].available = false;
        }
    }
    game.unselect();
    update();
});
function choosePromotion(promotion) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = undefined;
        let promise = new Promise((resolve) => {
            canvas.addEventListener('mousedown', (event) => {
                event.preventDefault();
                if (event.button === 0) { //Only left click
                    const cell_coords = getCell(playerview, event.clientX, event.clientY);
                    if (promotion.file !== cell_coords.x
                        || ![promotion.queenY, promotion.rookY, promotion.bishopY, promotion.knightY].includes(cell_coords.y))
                        return;
                    switch (cell_coords.y) {
                        case promotion.queenY:
                            result = PieceType.Queen;
                            resolve();
                            break;
                        case promotion.rookY:
                            result = PieceType.Rook;
                            resolve();
                            break;
                        case promotion.bishopY:
                            result = PieceType.Bishop;
                            resolve();
                            break;
                        case promotion.knightY:
                            result = PieceType.Knight;
                            resolve();
                            break;
                        default:
                            throw new Error("Unreachable");
                    }
                }
            });
        });
        canvas.removeEventListener('mousedown', clickdown);
        yield promise.then();
        canvas.addEventListener('mousedown', clickdown);
        return result;
    });
}
