class Game {
    constructor() {
        this.board = defaultBoard()
        this.turn = Color.White
        this.moves = []
        this.selecting = false
        this.selectedCell = null
    }

    select(cell) {
        this.selecting = true
        this.selectedCell = cell
        this.selectedCell.selected = true
    }

    unselect() {
        this.selecting = false
        this.selectedCell.selected = false
        this.selectedCell = null
    }

    play() {
        // console.log((this.moves.slice(-1)[0]).toString())
        if (this.turn === Color.White) {
            this.turn = Color.Black
        } else if (this.turn === Color.Black) {
            this.turn = Color.White
        }
    }

}
