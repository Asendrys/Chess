class Game {
    board : Board
    turn : Color
    moves: Array<Move>
    selecting : boolean
    selectedCell : Cell | null
    whiteCaptures : Array<Piece>
    blackCaptures : Array<Piece>

    constructor() {
        this.board = defaultBoard()
        this.turn = Color.White
        this.moves = []
        this.selecting = false
        this.selectedCell = null
        this.whiteCaptures = []
        this.blackCaptures = []
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
