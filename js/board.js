"use strict";
class Cell {
    constructor(x, y, piece = new Piece(Color.None, PieceType.None)) {
        this.y = y; //Row index
        this.x = x; //Column index
        this.piece = piece;
        this.selected = false;
        this.marked = false;
        this.available = false;
        this.inCheck = false;
    }
}
const defaultBoard = () => {
    const board = Array(8).fill(null);
    for (let row = 0; row < 8; row++) {
        board[row] = Array(8).fill(null);
        for (let col = 0; col < 8; col++) {
            board[row][col] = new Cell(col, row);
        }
    }
    board[0][0].piece = new Piece(Color.Black, PieceType.Rook);
    board[0][1].piece = new Piece(Color.Black, PieceType.Knight);
    board[0][2].piece = new Piece(Color.Black, PieceType.Bishop);
    board[0][3].piece = new Piece(Color.Black, PieceType.Queen);
    board[0][4].piece = new Piece(Color.Black, PieceType.King);
    board[0][5].piece = new Piece(Color.Black, PieceType.Bishop);
    board[0][6].piece = new Piece(Color.Black, PieceType.Knight);
    board[0][7].piece = new Piece(Color.Black, PieceType.Rook);
    board[7][0].piece = new Piece(Color.White, PieceType.Rook);
    board[7][1].piece = new Piece(Color.White, PieceType.Knight);
    board[7][2].piece = new Piece(Color.White, PieceType.Bishop);
    board[7][3].piece = new Piece(Color.White, PieceType.Queen);
    board[7][4].piece = new Piece(Color.White, PieceType.King);
    board[7][5].piece = new Piece(Color.White, PieceType.Bishop);
    board[7][6].piece = new Piece(Color.White, PieceType.Knight);
    board[7][7].piece = new Piece(Color.White, PieceType.Rook);
    for (let col = 0; col < 8; col++) {
        board[1][col].piece = new Piece(Color.Black, PieceType.Pawn);
        board[6][col].piece = new Piece(Color.White, PieceType.Pawn);
    }
    return board;
};
const inBoundaries = (x, y) => {
    return 0 <= x && x < 8 && 0 <= y && y < 8;
};
