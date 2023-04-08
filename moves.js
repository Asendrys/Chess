class Move {
    constructor(game, oldX, oldY, targetX, targetY, enPassantX = null, enPassantY = null) {
        this.game = game
        this.oldX = oldX
        this.oldY = oldY
        this.targetX = targetX
        this.targetY = targetY
        this.pieceMoved = game.board[oldY][oldX].piece
        if (enPassantX === null || enPassantY === null) { //if not en passant
            this.pieceTaken = game.board[targetY][targetX].piece
        } else { //if en passant
            this.pieceTaken = game.board[enPassantY][enPassantX].piece
        }
    }
    toString() {
        return "(" + this.oldX + ", " + this.oldY + ") -> (" + this.targetX + ", " + this.targetY + ")"
    }
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
                // if (inBoundaries(currX-1, currY) && board[currY][currX-1].piece.justMoved)
                //     out.push({x:currX-1, y:currY+1}) //En passant
                
                // if (inBoundaries(currX+1, currY) && board[currY][currX+1].piece.justMoved)
                //     out.push({x:currX+1, y:currY+1}) //En passant
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
                // if (inBoundaries(currX-1, currY) && board[currY][currX-1].piece.justMoved)
                //     out.push({x:currX-1, y:currY-1}) //En passant
                
                // if (inBoundaries(currX+1, currY) && board[currY][currX+1].piece.justMoved)
                //     out.push({x:currX+1, y:currY-1}) //En passant
            }
            break;
        case PieceType.Knight:
            for (let col = -2; col <= 2; col++) {  
                for (let row = -2; row <= 2; row++) {
                    if (Math.abs(col+row) === 3 || Math.abs(col-row) === 3)
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
    //     board[elt.y][elt.x].color !== board[currY][currX].piece.color
    // })
    return out
}

removePiece = (game, x, y) => {
    const board = game.board
    const oldCell = board[y][x]
    const piece = oldCell.piece
    if (piece.pieceType === PieceType.None || piece.color === Color.None) return
    oldCell.piece = new Piece()
}

movePiece = (game, oldX, oldY, newX, newY) => {
    const board = game.board
    const oldCell = board[oldY][oldX]
    const newCell = board[newY][newX]

    const piece = oldCell.piece
    // if (piece.pieceType === PieceType.None) return

    //Check if right player's turn
    if (piece.color !== game.turn) return

    //Check if newCoords is in available cells
    let available = false
    for (const cell of availableCells(board, oldX, oldY)) {
        if (newX === cell.x && newY === cell.y) {
            available = true
            break
        }
    }
    if (!available) return

    let takenPiece = newCell.piece

    //if it is an en passant move:
    // if (piece.pieceType === PieceType.Pawn) {
    //     if ( inBoundaries(oldX-1, oldY) && board[oldY][oldX-1].piece.justMoved && newX === oldX-1) {
    //         takenPiece = board[oldY][oldX-1].piece
    //         board[oldY][oldX-1].piece = new Piece()
    //     }
    //     if (inBoundaries(oldX+1, oldY) && board[oldY][oldX+1].piece.justMoved && newX === oldX+1 && (newY === 2 || newY === 5)) {
    //         takenPiece = board[oldY][oldX+1].piece
    //         board[oldY][oldX+1].piece = new Piece()
    //     }
    // }

    oldCell.piece = new Piece()
    newCell.piece = piece

    // if (piece.justMoved) //for en passant
    //     piece.justMoved = false
    // if (!piece.hasMoved && piece.pieceType === PieceType.Pawn) { //Is true even if moves 1 forward
    //     piece.justMoved = true
    // }
    piece.hasMoved = true
    game.moves.push(new Move(game, oldX, oldY, newX, newY))
    game.play()

    return takenPiece
}

