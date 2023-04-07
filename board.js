const Color = { 
    None: -1,
    Black: 0,
    White: 1 
}

const PieceType = {
    None: -1,
    King: 0,
    Queen: 1,
    Rook: 2,
    Bishop: 3,
    Knight: 4, 
    Pawn: 5,
}

class Piece {
    constructor(color = Color.None, pieceType = PieceType.None) {
        this.color = color
        this.pieceType = pieceType
        this.hasMoved = false
        this.justMoved = false //for en passant
    }
}

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

    let Board = Array(8).fill(null)
    for (let row = 0; row < 8 ; row++) {
        Board[row] = Array(8).fill(null)
        for (let col = 0; col < 8; col++) {
            Board[row][col] = new Cell(y = col, x = row)
        }
    }

    for (let col = 0; col < 8 ; col++) {
        Board[0][col].piece.color = Color.Black;
        Board[1][col].piece.color = Color.Black;
        Board[6][col].piece.color = Color.White;
        Board[7][col].piece.color = Color.White;

        Board[1][col].piece.pieceType = PieceType.Pawn;
        Board[6][col].piece.pieceType = PieceType.Pawn;
    }

    [0, 7].forEach( (row) => {
        Board[row][0].piece.pieceType = PieceType.Rook;
        Board[row][1].piece.pieceType = PieceType.Knight;
        Board[row][2].piece.pieceType = PieceType.Bishop;
        Board[row][3].piece.pieceType = PieceType.Queen;
        Board[row][4].piece.pieceType = PieceType.King;
        Board[row][5].piece.pieceType = PieceType.Bishop;
        Board[row][6].piece.pieceType = PieceType.Knight;
        Board[row][7].piece.pieceType = PieceType.Rook;
    })

    return Board
}

inBoundaries = (x, y) => {
    return 0 <= x && x < 8 && 0 <= y && y < 8
}

availableCells = (board, currX, currY) => {
    let out = []
    //TODO : obstacles, king in check, etc
    const currPiece = board[currY][currX].piece
    switch (currPiece.pieceType) {
        case PieceType.Pawn:
            //Test if obstacle, if already moved, if en passant
            if (currPiece.color === Color.Black) {
                if (inBoundaries(currX, currY+1) && board[currY+1][currX].piece.pieceType === PieceType.None)
                    out.push({x:currX, y:currY+1}) //If not blocked in front
                if (inBoundaries(currX-1, currY+1) && board[currY+1][currX-1].piece.color === Color.White)
                    out.push({x:currX-1, y:currY+1}) //Diagonal
                if (inBoundaries(currX+1, currY+1) && board[currY+1][currX+1].piece.color === Color.White)
                    out.push({x:currX+1, y:currY+1}) //Diagonal
                if (!currPiece.hasMoved
                     && inBoundaries(currX, currY+1) && board[currY+1][currX].piece.pieceType === PieceType.None
                     && inBoundaries(currX, currY+2) && board[currY+2][currX].piece.pieceType === PieceType.None) //if first move
                    out.push({x:currX, y:3})
                if (inBoundaries(currX-1, currY) && board[currY][currX-1].piece.justMoved)
                    out.push({x:currX-1, y:currY+1}) //En passant
                
                if (inBoundaries(currX+1, currY) && board[currY][currX+1].piece.justMoved)
                    out.push({x:currX+1, y:currY+1}) //En passant
            }
            else if (currPiece.color === Color.White) {
                if (inBoundaries(currX, currY-1) && board[currY-1][currX].piece.pieceType === PieceType.None)
                    out.push({x:currX, y:currY-1}) //If not blocked in front
                if (inBoundaries(currX-1, currY-1) && board[currY-1][currX-1].piece.color === Color.Black)
                    out.push({x:currX-1, y:currY-1}) //Diagonal
                if (inBoundaries(currX+1, currY-1) && board[currY-1][currX+1].piece.color === Color.Black)
                    out.push({x:currX+1, y:currY-1}) //Diagonal
                    if (!currPiece.hasMoved
                         && inBoundaries(currX, currY-1) && board[currY-1][currX].piece.pieceType === PieceType.None
                         && inBoundaries(currX, currY-2) && board[currY-2][currX].piece.pieceType === PieceType.None) //if first move
                    out.push({x:currX, y:4})
                if (inBoundaries(currX-1, currY) && board[currY][currX-1].piece.justMoved)
                    out.push({x:currX-1, y:currY-1}) //En passant
                
                if (inBoundaries(currX+1, currY) && board[currY][currX+1].piece.justMoved)
                    out.push({x:currX+1, y:currY-1}) //En passant
            }
            break;
        case PieceType.Knight:
            for (let col = -2; col <= 2; col++) {  
                for (let row = -2; row <= 2; row++) {
                    if (Math.abs(col+row) === 3 || Math.abs(col-row) == 3)
                        out.push({x:currX+row, y:currY+col})
                }
            }
            break;

        case PieceType.Rook:
            for (let i = 0; i < 8; i++) {
                out.push({x:currX, y:i})
                out.push({x:i, y:currY})
            }
            break;
        case PieceType.Queen:
            for (let i = 0; i < 8; i++) {
            out.push({x:currX, y:i})
            out.push({x:i, y:currY})
            }
        case PieceType.Bishop:
            for (let i = 0; i < 8; i++) {
                out.push({x:currX+i, y:currY+i})
                out.push({x:currX-i, y:currY+i})
                out.push({x:currX+i, y:currY-i})
                out.push({x:currX-i, y:currY-i})
            }
            break;
        case PieceType.King: //Todo castle
            for (let col = currY-1; col <= currY+1; col++) {  
                for (let row = currX-1; row <= currX+1; row++) {
                    out.push({x:row, y:col})
                }
            }
        default:
            break;
    }
    //Remove cells occupied by other pieces of their own color //Doesn't work
    // out.filter(elt => {
    //     console.log(board[elt.y][elt.x])
    //     board[elt.y][elt.x].color !== board[currY][currX].piece.color
    // })
    return out
}

removePiece = (board, x, y) => {
    let oldCell = board[y][x]
    let piece = oldCell.piece
    if (piece.pieceType === PieceType.None || piece.color === Color.None) return

    oldCell.piece = new Piece()
}

movePiece = (board, oldX, oldY, newX, newY) => {
    let oldCell = board[oldY][oldX]
    let newCell = board[newY][newX]

    let piece = oldCell.piece
    if (piece.pieceType === PieceType.None) return

    let newCoords = {x:newCell.x, y:newCell.y}
    let available = false

    //Check if newCoords is in available cells
    for (const cell of availableCells(board, oldX, oldY)) {
        if (newCoords.x === cell.x && newCoords.y === cell.y) {
            available = true
            break
        }
    }
    if (!available) return

    let takenPiece = newCell.piece

    //if it is an en passant move:
    if (piece.pieceType == PieceType.Pawn) {
        if ( inBoundaries(oldX-1, oldY) && board[oldY][oldX-1].piece.justMoved && newCoords.x == oldX-1) {
            takenPiece = board[oldY][oldX-1].piece
            board[oldY][oldX-1].piece = new Piece()
        }
        if (inBoundaries(oldX+1, oldY) && board[oldY][oldX+1].piece.justMoved && newCoords.x == oldX+1 && (newCoords.y == 2 || newCoords.y == 5)) {
            takenPiece = board[oldY][oldX+1].piece
            board[oldY][oldX+1].piece = new Piece()
        }
    }

    oldCell.piece = new Piece()
    newCell.piece = piece

    if (piece.justMoved) //for en passant
        piece.justMoved = false
    if (!piece.hasMoved && piece.pieceType === PieceType.Pawn) { //Is true even if moves 1 forward
        piece.justMoved = true
    }
    piece.hasMoved = true

    return takenPiece
}

