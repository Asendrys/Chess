"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var MoveType;
(function (MoveType) {
    MoveType[MoveType["PAWN_PUSH"] = 0] = "PAWN_PUSH";
    MoveType[MoveType["PAWN_DOUBLE_PUSH"] = 1] = "PAWN_DOUBLE_PUSH";
    MoveType[MoveType["PAWN_TAKES"] = 2] = "PAWN_TAKES";
    MoveType[MoveType["PAWN_TAKES_EN_PASSANT"] = 3] = "PAWN_TAKES_EN_PASSANT";
    MoveType[MoveType["PAWN_PROMOTE"] = 4] = "PAWN_PROMOTE";
    MoveType[MoveType["PIECE_MOVE"] = 5] = "PIECE_MOVE";
    MoveType[MoveType["PIECE_TAKES"] = 6] = "PIECE_TAKES";
    MoveType[MoveType["CASTLE"] = 7] = "CASTLE";
})(MoveType || (MoveType = {}));
; //Todo.
class Move {
    constructor(game, oldX, oldY, targetX, targetY, enPassantX, enPassantY, castleTargetX, incrementCounter = true) {
        //castleTargetX is the file containing the rook to castle
        this.id = Move.n_moves;
        if (incrementCounter)
            Move.n_moves++;
        this.game = game;
        this.oldX = oldX;
        this.oldY = oldY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.pieceMoved = game.board.at(oldY, oldX).piece;
        if (enPassantX === undefined || enPassantY === undefined) { //if not en passant
            if (game.board.at(targetY, targetX).piece !== undefined)
                this.pieceTaken = game.board.at(targetY, targetX).piece;
        }
        else { //if en passant
            this.pieceTaken = game.board.at(enPassantY, enPassantX).piece;
        }
        if (castleTargetX !== undefined) {
            this.pieceCastled = game.board.at(targetY, castleTargetX).piece;
        }
    }
    toString() {
        return this.id + "(" + this.oldX + ", " + this.oldY + ") -> (" + this.targetX + ", " + this.targetY + ")";
    }
}
Move.n_moves = 0;
function isInCheck(game, byColor, y, x, otherBoard) {
    const board = (otherBoard === undefined) ? game.board : otherBoard;
    if (!inBoundaries(x, y))
        return false;
    const piecesOfColor = (byColor === Color.Black) ? game.blackPieces : game.whitePieces;
    for (const piece of piecesOfColor) {
        if (piece.isOut)
            break;
        if ([...availableCells(game, piece.x, piece.y, false, board)].some((cell) => { return cell.x === x && cell.y === y; })) {
            return true;
        }
    }
    return false;
}
/**
 *
 * @param board Board
 * @param out Array of available cells
 * @param currPiece
 * @param blocked
 * @param x
 * @param y
 * @returns cell at (x, y) is available. Modifies out. Used in straightAvailableCells().
 */
function dirAvailableCells(board, out, currPiece, blocked, x, y) {
    var _a, _b;
    if (!blocked && inBoundaries(x, y)) {
        const mayBlock = board.at(y, x);
        if (((_a = mayBlock === null || mayBlock === void 0 ? void 0 : mayBlock.piece) === null || _a === void 0 ? void 0 : _a.color) === currPiece.color) { //if blocked by same color piece
            blocked = true;
        }
        else
            out.push({ x: x, y: y });
        if (((_b = mayBlock === null || mayBlock === void 0 ? void 0 : mayBlock.piece) === null || _b === void 0 ? void 0 : _b.color) === otherColor(currPiece.color)) { //if blocked by other color piece
            blocked = true;
        }
    }
    return blocked;
}
function straightAvailableCells(board, currX, currY) {
    const out = [];
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        throw new Error(`straightAvailableCells: piece in x=${currX}, y=${currY} is undefined`);
    let westBlocked = false;
    let eastBlocked = false;
    let northBlocked = false;
    let southBlocked = false;
    for (let offset = 1; offset < 8; offset++) {
        southBlocked = dirAvailableCells(board, out, currPiece, southBlocked, currX, currY + offset);
        northBlocked = dirAvailableCells(board, out, currPiece, northBlocked, currX, currY - offset);
        westBlocked = dirAvailableCells(board, out, currPiece, westBlocked, currX - offset, currY);
        eastBlocked = dirAvailableCells(board, out, currPiece, eastBlocked, currX + offset, currY);
    }
    return out;
}
function diagAvailableCells(board, currX, currY) {
    const out = [];
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        throw new Error(`diagAvailableCells: piece at x=${currX}, y=${currY} is undefined`);
    let nwBlocked = false;
    let neBlocked = false;
    let swBlocked = false;
    let seBlocked = false;
    for (let offset = 1; offset < 8; offset++) {
        seBlocked = dirAvailableCells(board, out, currPiece, seBlocked, currX + offset, currY + offset);
        neBlocked = dirAvailableCells(board, out, currPiece, neBlocked, currX + offset, currY - offset);
        nwBlocked = dirAvailableCells(board, out, currPiece, nwBlocked, currX - offset, currY - offset);
        swBlocked = dirAvailableCells(board, out, currPiece, swBlocked, currX - offset, currY + offset);
    }
    return out;
}
function pushForwardAvaibleCell(board, currX, currY) {
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        throw new Error(`pushForwardAvaibleCell: piece at x= ${currX}, y=${currY} is undefined`);
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    if (!board.at(currY + forwardDir, currX).piece)
        return [{ x: currX, y: currY + forwardDir }];
    return [];
}
function startPushForwardAvaibleCell(board, currX, currY) {
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        throw new Error(`startPushForwardAvaibleCell: piece at x= ${currX}, y=${currY} is undefined`);
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    if (!currPiece.hasMoved
        && board.at(currY + forwardDir, currX).piece === undefined)
        return [{ x: currX, y: currY + 2 * forwardDir }];
    return [];
}
function takeDiagonalForwardAvailableCell(board, currX, currY) {
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        throw new Error(`takeDiagonalForwardAvailableCell: piece at x= ${currX}, y=${currY} is undefined`);
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    const out = [];
    for (const offset of [1, -1]) { //previously : offset = +1 -> diagRight ; = -1 -> diagLeft
        if (inBoundaries(currX + offset, currY + forwardDir)) {
            const diagOffset = board.at(currY + forwardDir, currX + offset).piece;
            if (diagOffset !== undefined && diagOffset.color === otherColor(currPiece.color))
                out.push({ x: currX + offset, y: currY + forwardDir });
        }
    }
    return out;
}
function enPassantAvailableCell(game, currX, currY) {
    const currPiece = game.board.at(currY, currX).piece;
    if (currPiece === undefined)
        throw new Error(`enPassantAvailableCell: piece at x= ${currX}, y=${currY} is undefined`);
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    const lastMove = game.getLastMove();
    if (lastMove === null)
        return [];
    const lastPieceMoved = lastMove.pieceMoved;
    const out = [];
    for (const offset of [1, -1]) {
        if (inBoundaries(currX + offset, currY + forwardDir) && inBoundaries(currX + offset, currY)) {
            const offsetPiece = game.board.at(currY, currX + offset).piece; //previously : offset = +1 -> rightPiece ; = -1 -> leftPiece
            if (game.board.at(currY + forwardDir, currX + offset).piece === undefined //if no piece on diagonal
                && offsetPiece !== undefined
                && offsetPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
                && lastPieceMoved.isEquals(offsetPiece) //if it is the last piece moved
                && lastPieceMoved.enPassantable //if it just made an en passant
            )
                out.push({ x: currX + offset, y: currY + forwardDir });
        }
    }
    return out;
}
function isCastlePossible(board, currX, currY, targetX) {
    var _a, _b;
    if (((_a = board.at(currY, targetX).piece) === null || _a === void 0 ? void 0 : _a.type) === PieceType.Rook && !((_b = board.at(currY, targetX).piece) === null || _b === void 0 ? void 0 : _b.hasMoved)) {
        //test if no check in between
        const direction = currX > targetX ? -1 : 1;
        for (let offset = 1; Math.abs(currX + direction * offset - targetX) > 0; offset++) {
            if (board.at(currY, currX + direction * offset).piece !== undefined) //todo : inCheck
                return false;
        }
        return true;
    }
    return false;
}
function arrayToSet(arr) {
    return new Set([...arr]);
}
function concatSetAndArray(A, B) {
    return new Set([...A, ...B]);
}
function concatArraysToSet(A, B) {
    return new Set([...A, ...B]);
}
function availableCells(game, currX, currY, testInCheck = true, customBoard) {
    var _a, _b;
    const board = (customBoard === undefined) ? game.board : customBoard;
    let availableCellsSet = new Set();
    //TODO : king in check, etc
    if (board.at(currY, currX) === undefined)
        return availableCellsSet;
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        return availableCellsSet;
    switch (currPiece.type) {
        case PieceType.Pawn:
            availableCellsSet = concatSetAndArray(availableCellsSet, pushForwardAvaibleCell(board, currX, currY));
            if (availableCells.length > 0) //if forward is available
                availableCellsSet = concatSetAndArray(availableCellsSet, startPushForwardAvaibleCell(board, currX, currY));
            availableCellsSet = concatSetAndArray(availableCellsSet, takeDiagonalForwardAvailableCell(board, currX, currY));
            availableCellsSet = concatSetAndArray(availableCellsSet, enPassantAvailableCell(game, currX, currY));
            break;
        case PieceType.Knight:
            for (let col = -2; col <= 2; col++) {
                for (let row = -2; row <= 2; row++) {
                    if (inBoundaries(currX + row, currY + col)
                        && (Math.abs(col + row) === 3 || Math.abs(col - row) === 3) //if L-shape
                        && ((_a = board.at(currY + col, currX + row).piece) === null || _a === void 0 ? void 0 : _a.color) !== currPiece.color) //if not taking own pieces
                        availableCellsSet.add({ x: currX + row, y: currY + col });
                }
            }
            break;
        case PieceType.Rook:
            availableCellsSet = arrayToSet(straightAvailableCells(board, currX, currY));
            break;
        case PieceType.Queen:
            availableCellsSet = concatArraysToSet(straightAvailableCells(board, currX, currY), diagAvailableCells(board, currX, currY));
            break;
        case PieceType.Bishop:
            availableCellsSet = arrayToSet(diagAvailableCells(board, currX, currY));
            break;
        case PieceType.King:
            for (let row = currY - 1; row <= currY + 1; row++) {
                for (let col = currX - 1; col <= currX + 1; col++) {
                    if (inBoundaries(row, col)
                        && ((_b = board.at(row, col).piece) === null || _b === void 0 ? void 0 : _b.color) !== currPiece.color) {
                        if (!testInCheck || !isInCheck(game, otherColor(currPiece.color), row, col)) //if testInCheck == false, then we don't do the 2nd part (checking), and conversely.
                            availableCellsSet.add({ x: col, y: row });
                    }
                }
            }
            if (!currPiece.hasMoved) {
                if (isCastlePossible(board, currX, currY, 0))
                    availableCellsSet.add({ x: currX - 2, y: currY }); //left side castle
                if (isCastlePossible(board, currX, currY, 7))
                    availableCellsSet.add({ x: currX + 2, y: currY }); //right side castle
            }
            break;
        default:
            throw new Error("Unreachable");
    }
    if (testInCheck) {
        const color = currPiece.color;
        let king = (color === Color.White) ? game.whiteKing : game.blackKing;
        for (const cell of availableCellsSet) {
            const hiddenBoard = game.board.copy();
            // if (hiddenBoard.at(currX, currY)!.piece !== undefined)
            boardMovePiece(hiddenBoard, currX, currY, cell.x, cell.y);
            if (hiddenBoard.at(cell.y, cell.x).piece.type === PieceType.King) { //moved piece is the king
                if (isInCheck(game, otherColor(color), cell.y, cell.x, hiddenBoard)) {
                    availableCellsSet.delete(cell);
                }
                break;
            }
            if (isInCheck(game, otherColor(color), king.y, king.x, hiddenBoard)) {
                availableCellsSet.delete(cell);
            }
            // Testing :
            // drawBoardBg(hiddenCtx);
            // drawBoard(hiddenCtx, hiddenBoard);
        }
    }
    return availableCellsSet;
}
function removePiece(board, x, y) {
    const oldCell = board.at(y, x);
    if (oldCell.piece === undefined)
        return;
    oldCell.piece.x = undefined;
    oldCell.piece.y = undefined;
    oldCell.piece.isOut = true;
    oldCell.piece = undefined;
}
function boardMovePiece(board, oldX, oldY, targetX, targetY) {
    //Only manages changing the position of a piece on the board, regardless of other aspects, for that, see movePiece.
    if (!inBoundaries(targetX, targetY) || !inBoundaries(oldX, oldY))
        return;
    const piece = board.at(oldY, oldX).piece;
    if (piece === undefined) {
        return; //throw new Error(`boardMovePiece: piece at oldX=${oldX}, oldY=${oldY} is undefined`);
    }
    piece.x = targetX;
    piece.y = targetY;
    board.at(targetY, targetX).piece = piece; //new cell
    board.at(oldY, oldX).piece = undefined; //old cell
}
function promotion(piece, newPieceType) {
    piece.type = newPieceType;
    piece.image = getImage(piece.color, newPieceType);
}
function movePiece(game, oldX, oldY, newX, newY) {
    return __awaiter(this, void 0, void 0, function* () {
        clearMessage();
        const piece = game.board.at(oldY, oldX).piece;
        if (piece === undefined)
            return; //empty cell
        //Check if right player's turn
        if (piece.color !== game.turn) {
            message("It's not your turn!");
            return;
        }
        //Check if newCoords is in available cells
        if (![...availableCells(game, oldX, oldY)].some((coords_elt) => { return coords_elt.x === newX && coords_elt.y === newY; })) {
            message("This square is unavailable!");
            return;
        }
        //Test if pawn moved 2 cells
        piece.enPassantable = (piece.type === PieceType.Pawn && !piece.hasMoved && Math.abs(newY - oldY) === 2); //if it's pawn's first move two cells forwards.
        let move;
        //If castle
        if (piece.type === PieceType.King && !piece.hasMoved && Math.abs(oldX - newX) == 2) {
            const direction = oldX > newX ? 1 : -1; //1 : moves to the left, -1 : moves to the right
            const rookPosX = direction > 0 ? 0 : 7;
            const rookMovesToX = newX + direction;
            move = new Move(game, oldX, oldY, newX, newY, undefined, undefined, rookPosX);
            // game.moves.push(new Move(game, targetX, oldY, rookMovesToX, newY, undefined, undefined, undefined)) //add castle move
            boardMovePiece(game.board, rookPosX, newY, rookMovesToX, newY);
        }
        else if ( //en passant
        piece.type === PieceType.Pawn
            && oldX != newX //not same file
            && game.board.at(newY, newX).piece === undefined //diagonal but no piece on the target cell
        ) {
            move = new Move(game, oldX, oldY, newX, newY, newX, oldY);
            removePiece(game.board, newX, oldY); //remove en passant-ed pawn
        }
        else {
            move = new Move(game, oldX, oldY, newX, newY);
            if (game.board.at(newY, newX).piece !== undefined) //if taking a piece
                removePiece(game.board, newX, newY);
        }
        boardMovePiece(game.board, oldX, oldY, newX, newY);
        game.moves.push(move);
        //Test if promotion
        if (piece.type === PieceType.Pawn && [0, 7].includes(newY)) {
            const prom = new Promotion(piece.color, newX, newY, (newY == 0) ? 1 : -1);
            toDraw.add(prom);
            // promotion(piece, PieceType.Queen); //auto-promote to queen : temporary.
            promotion(piece, yield choosePromotion(prom));
            toDraw.delete(prom);
        }
        //Captures
        if (move.pieceTaken !== undefined) {
            if (game.turn === Color.White) {
                game.whiteCaptures.push(move.pieceTaken);
            }
            else if (game.turn === Color.Black) {
                game.blackCaptures.push(move.pieceTaken);
            }
        }
        game.nextTurn();
        // return move.pieceTaken
    });
}
