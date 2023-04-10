class Game {
    board : Board
    turn : Color
    moves: Array<Move>
    selecting : boolean
    selectedCell : Cell | null
    whitePieces : Array<Piece>
    blackPieces : Array<Piece>
    whiteKing : Piece
    blackKing : Piece
    whiteCaptures : Array<Piece>
    blackCaptures : Array<Piece>

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

        [6, 7].forEach((row:number) => {
            for (let col = 0; col < 8; col++) {
                this.whitePieces.push(this.board.at(row, col)?.piece!);
            }
        });
        [0, 1].forEach((row:number) => {
            for (let col = 0; col < 8; col++) {
                this.blackPieces.push(this.board.at(row, col)!.piece!);
            }
        });

        this.whiteCaptures = [];
        this.blackCaptures = [];
    }

    select(cell : Cell) : void {
        this.selecting = true
        this.selectedCell = cell
        this.selectedCell.selected = true
    }

    unselect() : void {
        this.selecting = false
        if (this.selectedCell !== null)
            this.selectedCell.selected = false
        this.selectedCell = null
    }

    nextTurn() : void {
        // console.log((this.moves.slice(-1)[0]).toString())
        if (this.turn === Color.White) {
            this.turn = Color.Black
        } else if (this.turn === Color.Black) {
            this.turn = Color.White
        }
    }

    getLastMove() : Move | null {
        if (this.moves.length === 0)
            return null
        return this.moves.slice(-1)[0]
    }

}
