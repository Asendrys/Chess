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

straightAvailableCells = (board, currX, currY) => {
    let out = []
    const currPiece = board[currY][currX].piece
    let westBlocked = false
    let eastBlocked = false
    let northBlocked = false
    let southBlocked = false
    for (let offset = 1; offset < 8; offset++) {
        if (!southBlocked && inBoundaries(currX, currY + offset)) {
            const mayBlock  = board[currY + offset][currX]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                southBlocked = true
            } else
                out.push({x:currX, y:currY + offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                southBlocked = true
            }
        }
        if (!northBlocked && inBoundaries(currX, currY - offset)) {
            const mayBlock  = board[currY - offset][currX]
            if (mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                northBlocked = true
            } else 
                out.push({x:currX, y:currY - offset})
            if (mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                northBlocked = true
            }
        }
        if (!westBlocked && inBoundaries(currX - offset, currY)) {
            const mayBlock  = board[currY][currX - offset]
            if (mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                westBlocked = true
            }
            else
                out.push({x:currX - offset, y:currY})
            if (mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                westBlocked = true
            }
        }
        if (!eastBlocked && inBoundaries(currX + offset, currY)) {
            const mayBlock  = board[currY][currX + offset]
            if (mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                eastBlocked = true
            } 
            else 
                out.push({x:currX + offset, y:currY})
            if (mayBlock.piece.color === otherColor(currPiece.color)) { //if blocked by other color piece
                eastBlocked = true
            }
        }
    }
    return out
}


diagAvailableCells = (board, currX, currY) => {
    let out = []
    const currPiece = board[currY][currX].piece
    let nwBlocked = false
    let neBlocked = false
    let swBlocked = false
    let seBlocked = false
    for (let offset = 1; offset < 8; offset++) {
        if (!seBlocked && inBoundaries(currX + offset, currY + offset)) {
            const mayBlock  = board[currY + offset][currX + offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                seBlocked = true
            } else
                out.push({x:currX + offset, y:currY + offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                seBlocked = true
            }
        }
        if (!neBlocked && inBoundaries(currX + offset, currY - offset)) {
            const mayBlock  = board[currY - offset][currX + offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                neBlocked = true
            } else
                out.push({x:currX + offset, y:currY - offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                neBlocked = true
            }
        }
        if (!nwBlocked && inBoundaries(currX - offset, currY - offset)) {
            const mayBlock  = board[currY - offset][currX - offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                nwBlocked = true
            } else
                out.push({x:currX - offset, y:currY - offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                nwBlocked = true
            }
        }
        if (!swBlocked && inBoundaries(currX - offset, currY + offset)) {
            const mayBlock  = board[currY + offset][currX - offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                swBlocked = true
            } else
                out.push({x:currX - offset, y:currY + offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                swBlocked = true
            }
        }
    }
    return out
}

pushForwardAvaibleCell = (board, currX, currY) => {
    const currPiece = board[currY][currX].piece
    const forwardDir = currPiece.color === Color.Black ? 1 : -1
    if (inBoundaries(currX, currY+forwardDir) && board[currY+forwardDir][currX].piece.pieceType === PieceType.None)
        return [{x:currX, y:currY+forwardDir}]
    return []
}

startPushForwardAvaibleCell = (board, currX, currY) => {
    const currPiece = board[currY][currX].piece
    const forwardDir = currPiece.color === Color.Black ? 2 : -2
    if (!currPiece.hasMoved && inBoundaries(currX, currY+forwardDir) && board[currY+forwardDir][currX].piece.pieceType === PieceType.None)
        return [{x:currX, y:currY+forwardDir}]
    return []
}

takeDiagonalForwardAvailableCell = (board, currX, currY) => {
    const currPiece = board[currY][currX].piece
    const forwardDir = currPiece.color === Color.Black ? 1 : -1
    let out = []
    if (inBoundaries(currX+1, currY+forwardDir) && board[currY+forwardDir][currX+1].piece.color === otherColor(currPiece.color))
        out.push({x:currX+1, y:currY+forwardDir})
    if (inBoundaries(currX-1, currY+forwardDir) && board[currY+forwardDir][currX-1].piece.color === otherColor(currPiece.color))
        out.push({x:currX-1, y:currY+forwardDir})
    return out
}

takeEnPassantAvailableCell = (game, currX, currY) => {
    const board = game.board
    const currPiece = board[currY][currX].piece
    const forwardDir = currPiece.color === Color.Black ? 1 : -1
    const lastPieceMoved = game.getLastMove().pieceMoved
    const out = []
    if (inBoundaries(currX+1, currY+forwardDir) && inBoundaries(currX+1, currY)) {
        const rightPiece = board[currY][currX+1].piece
        if (board[currY+forwardDir][currX+1].piece.pieceType === PieceType.None //if no piece on diagonal
        &&  rightPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
        &&  lastPieceMoved.isEquals(rightPiece) //if it is the last piece moved
        &&  lastPieceMoved.enPassantable //if it just made an en passant
        )
            out.push({x:currX+1, y:currY+forwardDir})
    }

    if (inBoundaries(currX-1, currY+forwardDir) && inBoundaries(currX-1, currY)) {
        const leftPiece = board[currY][currX-1].piece
        if (board[currY+forwardDir][currX-1].piece.pieceType === PieceType.None //if no piece on diagonal
        &&  leftPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
        &&  lastPieceMoved.isEquals(leftPiece) //if it is the last piece moved
        &&  lastPieceMoved.enPassantable //if it just made an en passant
        )
           out.push({x:currX-1, y:currY+forwardDir})
    }
    return out
}

availableCells = (game, currX, currY) => {
    const board = game.board
    let out = []
    //TODO : obstacles, king in check, etc
    const currPiece = board[currY][currX].piece
    switch (currPiece.pieceType) {
        case PieceType.Pawn:
            out = out.concat(pushForwardAvaibleCell(board, currX, currY))
            if (out.length > 0) //if forward is available
                out = out.concat(startPushForwardAvaibleCell(board, currX, currY))
            out = out.concat(takeDiagonalForwardAvailableCell(board, currX, currY))
            out = out.concat(takeEnPassantAvailableCell(game, currX, currY))
            break;
        case PieceType.Knight:
            for (let col = -2; col <= 2; col++) {  
                for (let row = -2; row <= 2; row++) {
                    if (inBoundaries(currX+row, currY+col) //if in boundaries
                    && (Math.abs(col+row) === 3 || Math.abs(col-row) === 3) //if L-shape
                    && board[currY+col][currX+row].piece.color !== currPiece.color) //if not taking own pieces
                        out.push({x:currX+row, y:currY+col})
                }
            }
            break;

        case PieceType.Rook:
            out = straightAvailableCells(board, currX, currY)
            break;
        case PieceType.Queen:
            out = straightAvailableCells(board, currX, currY).concat( diagAvailableCells(board, currX, currY) )
            break;
        case PieceType.Bishop:
            out = diagAvailableCells(board, currX, currY)
            break;
        case PieceType.King: //Todo castle
            for (let row = currY-1; row <= currY+1; row++) {  
                for (let col = currX-1; col <= currX+1; col++) {
                    if (inBoundaries(col, row) && board[row][col].piece.color !== currPiece.color)
                    out.push({x:col, y:row})
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
    clearMessage()
    const board = game.board
    const oldCell = board[oldY][oldX]
    const newCell = board[newY][newX]

    const piece = oldCell.piece
    // if (piece.pieceType === PieceType.None) return

    //Check if right player's turn
    if (piece.color !== game.turn) {
        message("It's not your turn!")
        return
    }

    //Check if newCoords is in available cells
    let available = false
    for (const cell of availableCells(game, oldX, oldY)) {
        if (newX === cell.x && newY === cell.y) {
            available = true
            break
        }
    }
    if (!available) {
        message("This square is unavailable!")
        return
    }

    let move = new Move(game, oldX, oldY, newX, newY)
    game.moves.push(move)

    let takenPiece = newCell.piece

    if (piece.enPassantable)
        piece.enPassantable = false
    if (piece.pieceType === PieceType.Pawn && !piece.hasMoved && Math.abs(newY - oldY) === 2) { //if pawn's first move two cells forwards.
        piece.enPassantable = true
    }

    piece.hasMoved = true

    oldCell.piece = new Piece()
    newCell.piece = piece
    
    //Captures
    if (move.pieceTaken.pieceType !== PieceType.None) {
        if (game.turn === Color.White) {
            game.whiteCaptures.push(move.pieceTaken)
        } else if (game.turn === Color.Black) {
            game.blackCaptures.push(move.pieceTaken)
        }
    }
    
    game.play()

    return move.pieceTaken
}

