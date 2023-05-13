"use strict";
class Game {
    constructor() {
        var _a, _b, _c;
        this.board = new Board();
        this.turn = Color.White;
        this.moves = [];
        this.selecting = false;
        this.selectedCell = null;
        this.whitePieces = [];
        this.blackPieces = [];
        this.whiteKing = (_a = this.board.at(7, 4)) === null || _a === void 0 ? void 0 : _a.piece;
        this.blackKing = (_b = this.board.at(0, 4)) === null || _b === void 0 ? void 0 : _b.piece;
        for (const row of [6, 7]) {
            for (let col = 0; col < 8; col++) {
                this.whitePieces.push((_c = this.board.at(row, col)) === null || _c === void 0 ? void 0 : _c.piece);
            }
        }
        for (const row of [0, 1]) {
            for (let col = 0; col < 8; col++) {
                this.blackPieces.push(this.board.at(row, col).piece);
            }
        }
        this.whiteCaptures = [];
        this.blackCaptures = [];
    }
    select(cell) {
        this.selecting = true;
        this.selectedCell = cell;
        this.selectedCell.selected = true;
    }
    unselect() {
        this.selecting = false;
        if (this.selectedCell !== null)
            this.selectedCell.selected = false;
        this.selectedCell = null;
    }
    nextTurn() {
        // console.log((this.moves.slice(-1)[0]).toString())
        this.turn = otherColor(this.turn);
    }
    getLastMove() {
        if (this.moves.length === 0)
            return null;
        return this.moves.slice(-1)[0];
    }
}
