class Cell {
    constructor(x, y, piece = new Piece(Color.None, PieceType.None)) {
        this.y = y //Row index
        this.x = x //Column index
        this.piece = piece
        this.selected = false
        this.marked = false
        this.available = false
        this.inCheck = false
    }
}


defaultBoard = () => {

    let board = Array(8).fill(null)
    for (let row = 0; row < 8 ; row++) {
        board[row] = Array(8).fill(null)
        for (let col = 0; col < 8; col++) {
            board[row][col] = new Cell(y = col, x = row)
        }
    }

    for (let col = 0; col < 8 ; col++) {
        board[0][col].piece.color = Color.Black;
        board[1][col].piece.color = Color.Black;
        board[6][col].piece.color = Color.White;
        board[7][col].piece.color = Color.White;

        board[1][col].piece.pieceType = PieceType.Pawn;
        board[6][col].piece.pieceType = PieceType.Pawn;
    }

    [0, 7].forEach( (row) => {
        board[row][0].piece.pieceType = PieceType.Rook;
        board[row][1].piece.pieceType = PieceType.Knight;
        board[row][2].piece.pieceType = PieceType.Bishop;
        board[row][3].piece.pieceType = PieceType.Queen;
        board[row][4].piece.pieceType = PieceType.King;
        board[row][5].piece.pieceType = PieceType.Bishop;
        board[row][6].piece.pieceType = PieceType.Knight;
        board[row][7].piece.pieceType = PieceType.Rook;
    })

    return board
}

inBoundaries = (x, y) => {
    return 0 <= x && x < 8 && 0 <= y && y < 8
}