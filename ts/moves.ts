enum MoveType {
    PAWN_PUSH,
    PAWN_DOUBLE_PUSH,
    PAWN_TAKES,
    PAWN_TAKES_EN_PASSANT,
    PAWN_PROMOTE,
    PIECE_MOVE,
    PIECE_TAKES,
    CASTLE
} //Todo.

class Move {
    static n_moves : number = 0;
    id: number;
    game : Game;
    oldX : number;
    oldY : number;
    targetX : number;
    targetY : number;
    pieceMoved : Piece;
    pieceTaken ?: Piece;
    pieceCastled ?: Piece;

    constructor(game:Game, oldX:number, oldY:number, targetX:number, targetY:number, enPassantX ?:number, enPassantY ?:number, castleTargetX ?: number, incrementCounter : boolean = true) {
        //castleTargetX is the file containing the rook to castle
        this.id = Move.n_moves
        if (incrementCounter)
            Move.n_moves++
        
        this.game = game
        this.oldX = oldX
        this.oldY = oldY
        this.targetX = targetX
        this.targetY = targetY

        this.pieceMoved = game.board.at(oldY, oldX)!.piece !

        if (enPassantX === undefined || enPassantY === undefined) { //if not en passant
            if (game.board.at(targetY, targetX)!.piece !== undefined)
                this.pieceTaken = game.board.at(targetY, targetX)!.piece
        } else { //if en passant
            this.pieceTaken = game.board.at(enPassantY, enPassantX)!.piece
        }
        if (castleTargetX !== undefined) {
            this.pieceCastled = game.board.at(targetY, castleTargetX)!.piece
        }

    }

    toString():string {
        return this.id + "(" + this.oldX + ", " + this.oldY + ") -> (" + this.targetX + ", " + this.targetY + ")";
    }
}

const isInCheck = (game:Game, byColor : Color, y:number, x:number) : boolean => {
    if (!inBoundaries(x, y))
        return false;
    switch (byColor) {
        case Color.Black:
            //iterating through the black pieces
            for (const blackPiece of game.blackPieces ) {
                if (blackPiece.isOut)
                    break;
                if ( [...availableCells(game, blackPiece.x!, blackPiece.y!, false)].some( (cell) => {return cell.x === x && cell.y === y}) ) {
                    return true;
                }
            }
            break;
        case Color.White:
            //iterating through the white pieces
            for (const whitePiece of game.whitePieces ) {
                if (whitePiece.isOut)
                    break;
                if ( [...availableCells(game, whitePiece.x!, whitePiece.y!, false)].some( (cell) => {return cell.x === x && cell.y === y}) ) {
                    return true;
                }
            }
            break;
        default:
            throw new Error("unreachable")
    }
    return false;
}

const dirAvailableCells = (board:Board, out:Array<{x:number, y:number}>, currPiece:Piece, blocked:boolean, x:number, y:number, ) : boolean => {
    if (!blocked && inBoundaries(x, y)) {
        const mayBlock:Cell = board.at(y, x)!
        if ( mayBlock.piece?.color === currPiece.color) { //if blocked by same color piece
            blocked = true
        } else
            out.push({x:x, y:y})
        if ( mayBlock.piece?.color === otherColor(currPiece.color)) {//if blocked by other color piece
            blocked = true
        }
    }
    return blocked;
}

const straightAvailableCells = (board:Board, currX:number, currY:number) : Array<{x:number, y:number}> => {
    const out:Array<{x:number, y:number}> = []
    const currPiece:Piece = board.at(currY, currX)!.piece !
    let westBlocked:boolean = false
    let eastBlocked:boolean = false
    let northBlocked:boolean = false
    let southBlocked:boolean = false
    for (let offset:number = 1; offset < 8; offset++) {
        southBlocked = dirAvailableCells(board, out, currPiece, southBlocked, currX, currY + offset)
        northBlocked = dirAvailableCells(board, out, currPiece, northBlocked, currX, currY - offset)
        westBlocked  = dirAvailableCells(board, out, currPiece, westBlocked, currX-offset, currY)
        eastBlocked  = dirAvailableCells(board, out, currPiece, eastBlocked, currX+offset, currY)
    }
    return out
}

const diagAvailableCells = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const out:Array<{x:number, y:number}> = []
    const currPiece:Piece = board.at(currY, currX)!.piece !
    let nwBlocked:boolean = false
    let neBlocked:boolean = false
    let swBlocked:boolean = false
    let seBlocked:boolean = false
    for (let offset:number = 1; offset < 8; offset++) {
        seBlocked = dirAvailableCells(board, out, currPiece, seBlocked, currX + offset, currY + offset)
        neBlocked = dirAvailableCells(board, out, currPiece, neBlocked, currX + offset, currY - offset)
        nwBlocked = dirAvailableCells(board, out, currPiece, nwBlocked, currX - offset, currY - offset)
        swBlocked = dirAvailableCells(board, out, currPiece, swBlocked, currX - offset, currY + offset)
    }
    return out
}

const pushForwardAvaibleCell = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece : Piece = board.at(currY, currX)!.piece !
    const forwardDir : number = currPiece.color === Color.Black ? 1 : -1
    if (!board.at(currY+forwardDir, currX)?.piece)
        return [{x:currX, y:currY+forwardDir}]
    return []
}

const startPushForwardAvaibleCell = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece:Piece = board.at(currY, currX)!.piece !
    const forwardDir:number = currPiece.color === Color.Black ? 1 : -1
    if (
        !currPiece.hasMoved
        && board.at(currY+forwardDir, currX)?.piece === undefined)
        return [{x:currX, y:currY+2*forwardDir}]
    return []
}

const takeDiagonalForwardAvailableCell = (board:Board, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece:Piece = board.at(currY, currX)!.piece !

    const forwardDir:number = currPiece.color === Color.Black ? 1 : -1
    
    const out:Array<{x:number, y:number}> = []

    if (inBoundaries(currX+1, currY+forwardDir)) {
        const diagRight = board.at(currY+forwardDir, currX+1)!.piece;
        if (diagRight !== undefined && diagRight.color === otherColor(currPiece.color))
            out.push({x:currX+1, y:currY+forwardDir});
    }
    if (inBoundaries(currX-1, currY+forwardDir)) {
        const diagLeft = board.at(currY+forwardDir, currX-1)!.piece;
        if (diagLeft !== undefined && diagLeft.color === otherColor(currPiece.color))
            out.push({x:currX-1, y:currY+forwardDir})
    }
    return out
}

const enPassantAvailableCell = (game:Game, currX:number, currY:number):Array<{x:number, y:number}> => {
    const currPiece : Piece = game.board.at(currY, currX)!.piece !
    const forwardDir : number = currPiece.color === Color.Black ? 1 : -1
    const lastMove = game.getLastMove()
    if (lastMove === null)
        return []
    const lastPieceMoved : Piece = lastMove.pieceMoved
    const out : Array<{x:number, y:number}> = []
    if (inBoundaries(currX+1, currY+forwardDir) && inBoundaries(currX+1, currY)) {
        const rightPiece = game.board.at(currY, currX+1)!.piece
        if (game.board.at(currY+forwardDir, currX+1)!.piece === undefined //if no piece on diagonal
        &&  rightPiece !== undefined
        &&  rightPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
        &&  lastPieceMoved.isEquals(rightPiece) //if it is the last piece moved
        &&  lastPieceMoved.enPassantable //if it just made an en passant
        )
            out.push({x:currX+1, y:currY+forwardDir})
    }

    if (inBoundaries(currX-1, currY+forwardDir) && inBoundaries(currX-1, currY)) {
        const leftPiece = game.board.at(currY, currX-1)!.piece
        if (game.board.at(currY+forwardDir, currX-1)!.piece === undefined //if no piece on diagonal
        &&  leftPiece !== undefined
        &&  leftPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
        &&  lastPieceMoved.isEquals(leftPiece) //if it is the last piece moved
        &&  lastPieceMoved.enPassantable //if it just made an en passant
        )
           out.push({x:currX-1, y:currY+forwardDir})
    }
    return out
}

const isCastlePossible = (board : Board, currX : number, currY : number, targetX : number):boolean => {
    if (board.at(currY, targetX)!.piece?.type === PieceType.Rook && !board.at(currY, targetX)!.piece?.hasMoved) {
        //test if no check in between
        const direction : number = currX > targetX ? -1 : 1;
        for (let offset : number = 1; Math.abs(currX + direction * offset - targetX) > 0 ; offset++) {
            if (board.at(currY, currX + direction * offset)!.piece !== undefined) //todo : inCheck
                return false;
        }
        return true;
    }
    return false;
}

const availableCells = (game : Game, currX:number, currY:number, testInCheck:boolean = true) : Set<{x: number, y: number}> => {
    const board:Board = game.board;
    let availableCellsSet : Set<{x: number, y: number}> = new Set();
    //TODO : king in check, etc
    if (board.at(currY, currX) === undefined)
        return availableCellsSet;
    const currPiece = board.at(currY, currX)!.piece;

    if (currPiece === undefined)
        return availableCellsSet;

    switch (currPiece.type) {
        case PieceType.Pawn:
            availableCellsSet = new Set([...availableCellsSet, ...pushForwardAvaibleCell(board, currX, currY) ]);
            if (availableCells.length > 0) //if forward is available
                availableCellsSet =  new Set([...availableCellsSet, ...startPushForwardAvaibleCell(board, currX, currY) ]);
            availableCellsSet = new Set([...availableCellsSet, ...takeDiagonalForwardAvailableCell(board, currX, currY)])
            availableCellsSet = new Set([...availableCellsSet, ...enPassantAvailableCell(game, currX, currY)])
            break;
        case PieceType.Knight:
            for (let col:number = -2; col <= 2; col++) {  
                for (let row:number = -2; row <= 2; row++) {
                    if ( inBoundaries(currX+row, currY+col)
                    && (Math.abs(col+row) === 3 || Math.abs(col-row) === 3) //if L-shape
                    && board.at(currY+col, currX+row)!.piece?.color !== currPiece.color) //if not taking own pieces
                    availableCellsSet.add({x:currX+row, y:currY+col})
                }
            }
            break;

        case PieceType.Rook:
            availableCellsSet = new Set([...straightAvailableCells(board, currX, currY)])
            break;
        case PieceType.Queen:
            availableCellsSet = new Set ([...straightAvailableCells(board, currX, currY), ... diagAvailableCells(board, currX, currY)])
            break;
        case PieceType.Bishop:
            availableCellsSet = new Set ([...diagAvailableCells(board, currX, currY)])
            break;
        case PieceType.King: //Todo castle
            for (let row:number = currY-1; row <= currY+1; row++) {  
                for (let col:number = currX-1; col <= currX+1; col++) {
                    if (inBoundaries(row, col) && !board.at(row, col)!.inCheckBy.has(otherColor(currPiece.color)) && board.at(row, col)!.piece?.color !== currPiece.color)
                    availableCellsSet.add({x:col, y:row})
                }
            }
            if (!currPiece.hasMoved) {
                if (isCastlePossible(board, currX, currY, 0))   
                    availableCellsSet.add({x:currX-2, y:currY}) //left side castle
                if (isCastlePossible(board, currX, currY, 7))   
                    availableCellsSet.add({x:currX+2, y:currY}) //right side castle
            }
            break;
        default:
            throw new Error("Unreachable")
    }

    if (testInCheck) { //to fix : with MoveType.
        const color : Color = currPiece.color;
        const king : Piece = color === Color.White ? game.whiteKing : game.blackKing;
        for (const cell of availableCellsSet) {
            // boardMovePiece(board, currX, currY, cell.x, cell.y, false)
            if (isInCheck(game, otherColor(color), king.y!, king.x!)) {
                availableCellsSet.delete(cell);
            }
            // boardMovePiece(board, cell.x, cell.y, currX, currY, false)
        }
    }
    

    return availableCellsSet
}

const removePiece = (board:Board, x:number, y:number) : void => {
    const oldCell:Cell = board.at(y, x)!;
    if (oldCell.piece === undefined) return
    oldCell.piece.x = undefined;
    oldCell.piece.y = undefined;
    oldCell.piece.isOut = true;
    oldCell.piece = undefined
}

const boardMovePiece = (board:Board, oldX:number, oldY:number, targetX:number, targetY:number, sideEffects : boolean = true) : void => {
    //Only manages changing the position of a piece on the board, regardless of other aspects, for that, see movePiece.
    if (!inBoundaries(targetX, targetY) || !inBoundaries(oldX, oldY))
        return;

    board.at(oldY, oldX)!.piece!.x = targetX;
    board.at(oldY, oldX)!.piece!.y = targetY;
    if (sideEffects)
        board.at(oldY, oldX)!.piece!.hasMoved = true;
    //endif
    board.at(targetY, targetX)!.piece = board.at(oldY, oldX)!.piece; //new cell
    board.at(oldY, oldX)!.piece = undefined; //old cell
}

const promotion = (piece : Piece, newPieceType : PieceType) => {
    piece.type = newPieceType;
    piece.image = getImage(piece.color, newPieceType);
}

const movePiece = async (game:Game, oldX:number, oldY:number, newX:number, newY:number) : Promise<void> => {
    clearMessage()

    const piece = game.board.at(oldY, oldX)!.piece
    if (piece === undefined) return //empty cell

    //Check if right player's turn
    if (piece.color !== game.turn) {
        message("It's not your turn!")
        return
    }

    //Check if newCoords is in available cells
    if (![...availableCells(game, oldX, oldY)].some((coords_elt) => {return coords_elt.x === newX && coords_elt.y === newY})) {
        message("This square is unavailable!")
        return
    }

    //Test if pawn moved 2 cells
    piece.enPassantable = (piece.type === PieceType.Pawn && !piece.hasMoved && Math.abs(newY - oldY) === 2) //if it's pawn's first move two cells forwards.

    let move;
    //If castle
    if (piece.type === PieceType.King && !piece.hasMoved && Math.abs(oldX - newX) == 2) {
        const direction : number = oldX > newX ? 1 : -1; //1 : moves to the left, -1 : moves to the right
        const rookPosX : number = direction > 0 ? 0 : 7;
        const rookMovesToX : number = newX + direction;
        move = new Move(game, oldX, oldY, newX, newY, undefined, undefined, rookPosX)
        // game.moves.push(new Move(game, targetX, oldY, rookMovesToX, newY, undefined, undefined, undefined)) //add castle move
        boardMovePiece(game.board, rookPosX, newY, rookMovesToX, newY)

    } else if ( //en passant
        piece.type === PieceType.Pawn
        && oldX != newX //not same file
        && game.board.at(newY, newX)!.piece === undefined //diagonal but no piece on the target cell
    ) {
        move = new Move(game, oldX, oldY, newX, newY, newX, oldY)
        removePiece(game.board, newX, oldY) //remove en passant-ed pawn
    }
    else {
        move = new Move(game, oldX, oldY, newX, newY)
        if (game.board.at(newY, newX)!.piece !== undefined) //if taking a piece
            removePiece(game.board, newX, newY)
    }

    boardMovePiece(game.board, oldX, oldY, newX, newY)
    game.moves.push(move as Move)


    //Test if promotion
    if (piece.type === PieceType.Pawn && [0, 7].includes(newY)) {
        const prom : Promotion = new Promotion(piece.color, newX, newY, newY == 0 ? 1 : -1)
        toDraw.add(prom)
        // promotion(piece, PieceType.Queen); //auto-promote to queen : temporary.
        promotion(piece, await choosePromotion(prom))
        toDraw.delete(prom)
    }

    //Captures
    if (move.pieceTaken !== undefined) {
        if (game.turn === Color.White) {
            game.whiteCaptures.push(move.pieceTaken)
        } else if (game.turn === Color.Black) {
            game.blackCaptures.push(move.pieceTaken)
        }
    }
 
    game.nextTurn()

    // return move.pieceTaken
}

