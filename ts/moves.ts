class Move {
    game:Game;
    oldX:number;
    oldY:number;
    targetX:number;
    targetY:number;
    pieceMoved:Piece;
    pieceTaken:Piece;

    constructor(game:Game, oldX:number, oldY:number, targetX:number, targetY:number, enPassantX:number | null = null, enPassantY:number | null = null) {
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
    toString():string {
        return "(" + this.oldX + ", " + this.oldY + ") -> (" + this.targetX + ", " + this.targetY + ")"
    }
}

const straightAvailableCells = (board:Board, currX:number, currY:number) : Array<{x:number, y:number}> => {
    const out:Array<{x:number, y:number}> = []
    const currPiece:Piece = board[currY][currX].piece
    let westBlocked:boolean = false
    let eastBlocked:boolean = false
    let northBlocked:boolean = false
    let southBlocked:boolean = false
    for (let offset:number = 1; offset < 8; offset++) {
        if (!southBlocked && inBoundaries(currX, currY + offset)) {
            const mayBlock:Cell = board[currY + offset][currX]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                southBlocked = true
            } else
                out.push({x:currX, y:currY + offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                southBlocked = true
            }
        }
        if (!northBlocked && inBoundaries(currX, currY - offset)) {
            const mayBlock:Cell = board[currY - offset][currX]
            if (mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                northBlocked = true
            } else 
                out.push({x:currX, y:currY - offset})
            if (mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                northBlocked = true
            }
        }
        if (!westBlocked && inBoundaries(currX - offset, currY)) {
            const mayBlock:Cell = board[currY][currX - offset]
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
            const mayBlock:Cell  = board[currY][currX + offset]
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


const diagAvailableCells = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const out:Array<{x:number, y:number}> = []
    const currPiece:Piece = board[currY][currX].piece
    let nwBlocked:boolean = false
    let neBlocked:boolean = false
    let swBlocked:boolean = false
    let seBlocked:boolean = false
    for (let offset:number = 1; offset < 8; offset++) {
        if (!seBlocked && inBoundaries(currX + offset, currY + offset)) {
            const mayBlock:Cell = board[currY + offset][currX + offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                seBlocked = true
            } else
                out.push({x:currX + offset, y:currY + offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                seBlocked = true
            }
        }
        if (!neBlocked && inBoundaries(currX + offset, currY - offset)) {
            const mayBlock:Cell = board[currY - offset][currX + offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                neBlocked = true
            } else
                out.push({x:currX + offset, y:currY - offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                neBlocked = true
            }
        }
        if (!nwBlocked && inBoundaries(currX - offset, currY - offset)) {
            const mayBlock:Cell = board[currY - offset][currX - offset]
            if ( mayBlock.piece.color === currPiece.color) { //if blocked by same color piece
                nwBlocked = true
            } else
                out.push({x:currX - offset, y:currY - offset})
            if ( mayBlock.piece.color === otherColor(currPiece.color)) {//if blocked by other color piece
                nwBlocked = true
            }
        }
        if (!swBlocked && inBoundaries(currX - offset, currY + offset)) {
            const mayBlock:Cell = board[currY + offset][currX - offset]
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

const pushForwardAvaibleCell = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece : Piece = board[currY][currX].piece
    const forwardDir : number = currPiece.color === Color.Black ? 1 : -1
    if (inBoundaries(currX, currY+forwardDir) && board[currY+forwardDir][currX].piece.pieceType === PieceType.None)
        return [{x:currX, y:currY+forwardDir}]
    return []
}

const startPushForwardAvaibleCell = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece:Piece = board[currY][currX].piece
    const forwardDir:number = currPiece.color === Color.Black ? 2 : -2
    if (!currPiece.hasMoved && inBoundaries(currX, currY+forwardDir) && board[currY+forwardDir][currX].piece.pieceType === PieceType.None)
        return [{x:currX, y:currY+forwardDir}]
    return []
}

const takeDiagonalForwardAvailableCell = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece:Piece = board[currY][currX].piece
    const forwardDir:number = currPiece.color === Color.Black ? 1 : -1
    const out:Array<{x:number, y:number}> = []
    if (inBoundaries(currX+1, currY+forwardDir) && board[currY+forwardDir][currX+1].piece.color === otherColor(currPiece.color))
        out.push({x:currX+1, y:currY+forwardDir})
    if (inBoundaries(currX-1, currY+forwardDir) && board[currY+forwardDir][currX-1].piece.color === otherColor(currPiece.color))
        out.push({x:currX-1, y:currY+forwardDir})
    return out
}

const takeEnPassantAvailableCell = (game:Game, currX:number, currY:number):Array<{x:number, y:number}> => {
    const board : Board = game.board
    const currPiece : Piece = board[currY][currX].piece
    const forwardDir : number = currPiece.color === Color.Black ? 1 : -1
    if (game.getLastMove() === null)
        return []
    const lastPieceMoved : Piece = game.getLastMove()!.pieceMoved // "!" to fix
    const out : Array<{x:number, y:number}> = []
    if (inBoundaries(currX+1, currY+forwardDir) && inBoundaries(currX+1, currY)) {
        const rightPiece : Piece = board[currY][currX+1].piece
        if (board[currY+forwardDir][currX+1].piece.pieceType === PieceType.None //if no piece on diagonal
        &&  rightPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
        &&  lastPieceMoved.isEquals(rightPiece) //if it is the last piece moved
        &&  lastPieceMoved.enPassantable //if it just made an en passant
        )
            out.push({x:currX+1, y:currY+forwardDir})
    }

    if (inBoundaries(currX-1, currY+forwardDir) && inBoundaries(currX-1, currY)) {
        const leftPiece : Piece = board[currY][currX-1].piece
        if (board[currY+forwardDir][currX-1].piece.pieceType === PieceType.None //if no piece on diagonal
        &&  leftPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
        &&  lastPieceMoved.isEquals(leftPiece) //if it is the last piece moved
        &&  lastPieceMoved.enPassantable //if it just made an en passant
        )
           out.push({x:currX-1, y:currY+forwardDir})
    }
    return out
}

const availableCells = (game : Game, currX:number, currY:number) : Array<{x: number, y: number}> => {
    const board:Board = game.board
    let out:Array<{x: number, y: number}> = []
    //TODO : obstacles, king in check, etc
    const currPiece:Piece = board[currY][currX].piece
    switch (currPiece.pieceType) {
        case PieceType.Pawn:
            out = out.concat(pushForwardAvaibleCell(board, currX, currY))
            if (out.length > 0) //if forward is available
                out = out.concat(startPushForwardAvaibleCell(board, currX, currY))
            out = out.concat(takeDiagonalForwardAvailableCell(board, currX, currY))
            out = out.concat(takeEnPassantAvailableCell(game, currX, currY))
            break;
        case PieceType.Knight:
            for (let col:number = -2; col <= 2; col++) {  
                for (let row:number = -2; row <= 2; row++) {
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
            for (let row:number = currY-1; row <= currY+1; row++) {  
                for (let col:number = currX-1; col <= currX+1; col++) {
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

const removePiece = (game:Game, x:number, y:number) : void => {
    const board:Board = game.board
    const oldCell:Cell = board[y][x]
    const piece:Piece = oldCell.piece
    if (piece.pieceType === PieceType.None || piece.color === Color.None) return
    oldCell.piece = new Piece()
}

const movePiece = (game:Game, oldX:number, oldY:number, newX:number, newY:number) : void => {
    clearMessage()
    const board : Board = game.board
    const oldCell : Cell = board[oldY][oldX]
    const newCell : Cell = board[newY][newX]

    const piece : Piece = oldCell.piece
    // if (piece.pieceType === PieceType.None) return

    //Check if right player's turn
    if (piece.color !== game.turn) {
        message("It's not your turn!")
        return
    }

    //Check if newCoords is in available cells
    let available : boolean = false
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

    const move : Move = new Move(game, oldX, oldY, newX, newY)
    game.moves.push(move)

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

    // return move.pieceTaken
}

