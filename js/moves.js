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
})(MoveType || (MoveType = {})); //Todo.
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
const isInCheck = (game, byColor, y, x) => {
    if (!inBoundaries(x, y))
        return false;
    switch (byColor) {
        case Color.Black:
            //iterating through the black pieces
            for (const blackPiece of game.blackPieces) {
                if (blackPiece.isOut)
                    break;
                if ([...availableCells(game, blackPiece.x, blackPiece.y, false)].some((cell) => { return cell.x === x && cell.y === y; })) {
                    return true;
                }
            }
            break;
        case Color.White:
            //iterating through the white pieces
            for (const whitePiece of game.whitePieces) {
                if (whitePiece.isOut)
                    break;
                if ([...availableCells(game, whitePiece.x, whitePiece.y, false)].some((cell) => { return cell.x === x && cell.y === y; })) {
                    return true;
                }
            }
            break;
        default:
            throw new Error("unreachable");
    }
    return false;
};
const dirAvailableCells = (board, out, currPiece, blocked, x, y) => {
    var _a, _b;
    if (!blocked && inBoundaries(x, y)) {
        const mayBlock = board.at(y, x);
        if (((_a = mayBlock.piece) === null || _a === void 0 ? void 0 : _a.color) === currPiece.color) { //if blocked by same color piece
            blocked = true;
        }
        else
            out.push({ x: x, y: y });
        if (((_b = mayBlock.piece) === null || _b === void 0 ? void 0 : _b.color) === otherColor(currPiece.color)) { //if blocked by other color piece
            blocked = true;
        }
    }
    return blocked;
};
const straightAvailableCells = (board, currX, currY) => {
    const out = [];
    const currPiece = board.at(currY, currX).piece;
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
};
const diagAvailableCells = (board, currX, currY) => {
    const out = [];
    const currPiece = board.at(currY, currX).piece;
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
};
const pushForwardAvaibleCell = (board, currX, currY) => {
    var _a;
    const currPiece = board.at(currY, currX).piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    if (!((_a = board.at(currY + forwardDir, currX)) === null || _a === void 0 ? void 0 : _a.piece))
        return [{ x: currX, y: currY + forwardDir }];
    return [];
};
const startPushForwardAvaibleCell = (board, currX, currY) => {
    var _a;
    const currPiece = board.at(currY, currX).piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    if (!currPiece.hasMoved
        && ((_a = board.at(currY + forwardDir, currX)) === null || _a === void 0 ? void 0 : _a.piece) === undefined)
        return [{ x: currX, y: currY + 2 * forwardDir }];
    return [];
};
const takeDiagonalForwardAvailableCell = (board, currX, currY) => {
    const currPiece = board.at(currY, currX).piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    const out = [];
    if (inBoundaries(currX + 1, currY + forwardDir)) {
        const diagRight = board.at(currY + forwardDir, currX + 1).piece;
        if (diagRight !== undefined && diagRight.color === otherColor(currPiece.color))
            out.push({ x: currX + 1, y: currY + forwardDir });
    }
    if (inBoundaries(currX - 1, currY + forwardDir)) {
        const diagLeft = board.at(currY + forwardDir, currX - 1).piece;
        if (diagLeft !== undefined && diagLeft.color === otherColor(currPiece.color))
            out.push({ x: currX - 1, y: currY + forwardDir });
    }
    return out;
};
const enPassantAvailableCell = (game, currX, currY) => {
    const currPiece = game.board.at(currY, currX).piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    const lastMove = game.getLastMove();
    if (lastMove === null)
        return [];
    const lastPieceMoved = lastMove.pieceMoved;
    const out = [];
    if (inBoundaries(currX + 1, currY + forwardDir) && inBoundaries(currX + 1, currY)) {
        const rightPiece = game.board.at(currY, currX + 1).piece;
        if (game.board.at(currY + forwardDir, currX + 1).piece === undefined //if no piece on diagonal
            && rightPiece !== undefined
            && rightPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
            && lastPieceMoved.isEquals(rightPiece) //if it is the last piece moved
            && lastPieceMoved.enPassantable //if it just made an en passant
        )
            out.push({ x: currX + 1, y: currY + forwardDir });
    }
    if (inBoundaries(currX - 1, currY + forwardDir) && inBoundaries(currX - 1, currY)) {
        const leftPiece = game.board.at(currY, currX - 1).piece;
        if (game.board.at(currY + forwardDir, currX - 1).piece === undefined //if no piece on diagonal
            && leftPiece !== undefined
            && leftPiece.color === otherColor(currPiece.color) //if opponent's pawn to currPiece side
            && lastPieceMoved.isEquals(leftPiece) //if it is the last piece moved
            && lastPieceMoved.enPassantable //if it just made an en passant
        )
            out.push({ x: currX - 1, y: currY + forwardDir });
    }
    return out;
};
const isCastlePossible = (board, currX, currY, targetX) => {
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
};
const availableCells = (game, currX, currY, testInCheck = true) => {
    var _a, _b;
    const board = game.board;
    let availableCellsSet = new Set();
    //TODO : king in check, etc
    if (board.at(currY, currX) === undefined)
        return availableCellsSet;
    const currPiece = board.at(currY, currX).piece;
    if (currPiece === undefined)
        return availableCellsSet;
    switch (currPiece.type) {
        case PieceType.Pawn:
            availableCellsSet = new Set([...availableCellsSet, ...pushForwardAvaibleCell(board, currX, currY)]);
            if (availableCells.length > 0) //if forward is available
                availableCellsSet = new Set([...availableCellsSet, ...startPushForwardAvaibleCell(board, currX, currY)]);
            availableCellsSet = new Set([...availableCellsSet, ...takeDiagonalForwardAvailableCell(board, currX, currY)]);
            availableCellsSet = new Set([...availableCellsSet, ...enPassantAvailableCell(game, currX, currY)]);
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
            availableCellsSet = new Set([...straightAvailableCells(board, currX, currY)]);
            break;
        case PieceType.Queen:
            availableCellsSet = new Set([...straightAvailableCells(board, currX, currY), ...diagAvailableCells(board, currX, currY)]);
            break;
        case PieceType.Bishop:
            availableCellsSet = new Set([...diagAvailableCells(board, currX, currY)]);
            break;
        case PieceType.King: //Todo castle
            for (let row = currY - 1; row <= currY + 1; row++) {
                for (let col = currX - 1; col <= currX + 1; col++) {
                    if (inBoundaries(row, col) && !board.at(row, col).inCheckBy.has(otherColor(currPiece.color)) && ((_b = board.at(row, col).piece) === null || _b === void 0 ? void 0 : _b.color) !== currPiece.color)
                        availableCellsSet.add({ x: col, y: row });
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
    if (testInCheck) { //to fix : with MoveType.
        const color = currPiece.color;
        const king = color === Color.White ? game.whiteKing : game.blackKing;
        for (const cell of availableCellsSet) {
            // boardMovePiece(board, currX, currY, cell.x, cell.y, false)
            if (isInCheck(game, otherColor(color), king.y, king.x)) {
                availableCellsSet.delete(cell);
            }
            // boardMovePiece(board, cell.x, cell.y, currX, currY, false)
        }
    }
    return availableCellsSet;
};
const removePiece = (board, x, y) => {
    const oldCell = board.at(y, x);
    if (oldCell.piece === undefined)
        return;
    oldCell.piece.x = undefined;
    oldCell.piece.y = undefined;
    oldCell.piece.isOut = true;
    oldCell.piece = undefined;
};
const boardMovePiece = (board, oldX, oldY, targetX, targetY, sideEffects = true) => {
    //Only manages changing the position of a piece on the board, regardless of other aspects, for that, see movePiece.
    if (!inBoundaries(targetX, targetY) || !inBoundaries(oldX, oldY))
        return;
    board.at(oldY, oldX).piece.x = targetX;
    board.at(oldY, oldX).piece.y = targetY;
    if (sideEffects)
        board.at(oldY, oldX).piece.hasMoved = true;
    //endif
    board.at(targetY, targetX).piece = board.at(oldY, oldX).piece; //new cell
    board.at(oldY, oldX).piece = undefined; //old cell
};
const promotion = (piece, newPieceType) => {
    piece.type = newPieceType;
    piece.image = getImage(piece.color, newPieceType);
};
const movePiece = (game, oldX, oldY, newX, newY) => __awaiter(void 0, void 0, void 0, function* () {
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
        const prom = new Promotion(piece.color, newX, newY, newY == 0 ? 1 : -1);
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
