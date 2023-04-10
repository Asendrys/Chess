"use strict";
class Cell {
    constructor(x, y, piece) {
        this.y = y; //Row index
        this.x = x; //Column index
        this.piece = piece;
        this.selected = false;
        this.marked = false;
        this.available = false;
        this.inCheckBy = new Set();
    }
}
class Board {
    constructor() {
        this.elts = Array(8).fill(null);
        for (let row = 0; row < 8; row++) {
            this.elts[row] = Array(8).fill(null);
            for (let col = 0; col < 8; col++) {
                this.elts[row][col] = new Cell(col, row);
            }
        }
        this.elts[0][0].piece = new Piece(Color.Black, PieceType.Rook, 0, 0);
        this.elts[0][1].piece = new Piece(Color.Black, PieceType.Knight, 1, 0);
        this.elts[0][2].piece = new Piece(Color.Black, PieceType.Bishop, 2, 0);
        this.elts[0][3].piece = new Piece(Color.Black, PieceType.Queen, 3, 0);
        this.elts[0][4].piece = new Piece(Color.Black, PieceType.King, 4, 0);
        this.elts[0][5].piece = new Piece(Color.Black, PieceType.Bishop, 5, 0);
        this.elts[0][6].piece = new Piece(Color.Black, PieceType.Knight, 6, 0);
        this.elts[0][7].piece = new Piece(Color.Black, PieceType.Rook, 7, 0);
        this.elts[7][0].piece = new Piece(Color.White, PieceType.Rook, 0, 7);
        this.elts[7][1].piece = new Piece(Color.White, PieceType.Knight, 1, 7);
        this.elts[7][2].piece = new Piece(Color.White, PieceType.Bishop, 2, 7);
        this.elts[7][3].piece = new Piece(Color.White, PieceType.Queen, 3, 7);
        this.elts[7][4].piece = new Piece(Color.White, PieceType.King, 4, 7);
        this.elts[7][5].piece = new Piece(Color.White, PieceType.Bishop, 5, 7);
        this.elts[7][6].piece = new Piece(Color.White, PieceType.Knight, 6, 7);
        this.elts[7][7].piece = new Piece(Color.White, PieceType.Rook, 7, 7);
        for (let col = 0; col < 8; col++) {
            this.elts[1][col].piece = new Piece(Color.Black, PieceType.Pawn, col, 1);
            this.elts[6][col].piece = new Piece(Color.White, PieceType.Pawn, col, 6);
        }
    }
    at(y, x) {
        if (!inBoundaries(x, y))
            return;
        return this.elts[y][x];
    }
}
;
const inBoundaries = (x, y) => {
    return 0 <= x && x < 8 && 0 <= y && y < 8;
};
