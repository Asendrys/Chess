class Game {
    board : Board;
    turn : Color;
    moves: Array<Move>;
    selecting : boolean;
    selectedCell : Cell | null;
    whitePieces : Array<Piece>;
    blackPieces : Array<Piece>;
    whiteKing : Piece;
    blackKing : Piece;
    whiteCaptures : Array<Piece>;
    blackCaptures : Array<Piece>;

    constructor() {
        this.board = new Board();
        this.turn = Color.White;
        this.moves = [];
        this.selecting = false;
        this.selectedCell = null;
        this.whitePieces = [];
        this.blackPieces = [];

        this.whiteKing = this.board.at(7, 4)?.piece!;
        this.blackKing = this.board.at(0, 4)?.piece!;

        for (const row of [6, 7]) {
            for (let col = 0; col < 8; col++) {
                this.whitePieces.push(this.board.at(row, col)?.piece!);
            }
        }
        for (const row of [0, 1]) {
            for (let col = 0; col < 8; col++) {
                this.blackPieces.push(this.board.at(row, col)!.piece!);
            }
        }

        this.whiteCaptures = [];
        this.blackCaptures = [];
    }

    select(cell : Cell) : void {
        this.selecting = true;
        this.selectedCell = cell;
        this.selectedCell.selected = true;
    }

    unselect() : void {
        this.selecting = false;
        if (this.selectedCell !== null)
            this.selectedCell.selected = false;
        this.selectedCell = null;
    }

    nextTurn() : void {
        // console.log((this.moves.slice(-1)[0]).toString())
        this.turn = otherColor(this.turn);
    }

    getLastMove() : Move | null {
        if (this.moves.length === 0)
            return null;
        return this.moves.slice(-1)[0];
    }

}
