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
        this.pieceMoved = game.board[oldY][oldX].piece;
        if (enPassantX === undefined || enPassantY === undefined) { //if not en passant
            if (game.board[targetY][targetX].piece !== undefined)
                this.pieceTaken = game.board[targetY][targetX].piece;
        }
        else { //if en passant
            this.pieceTaken = game.board[enPassantY][enPassantX].piece;
        }
        if (castleTargetX !== undefined) {
            this.pieceCastled = game.board[targetY][castleTargetX].piece;
        }
        this.pieceMoved.hasMoved = true;
    }
    toString() {
        return this.id + "(" + this.oldX + ", " + this.oldY + ") -> (" + this.targetX + ", " + this.targetY + ")";
    }
}
Move.n_moves = 0;
const dirAvailableCells = (board, out, currPiece, blocked, x, y) => {
    var _a, _b;
    if (!blocked && inBoundaries(x, y)) {
        const mayBlock = board[y][x];
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
    const currPiece = board[currY][currX].piece;
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
    const currPiece = board[currY][currX].piece;
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
    const currPiece = board[currY][currX].piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    if (inBoundaries(currX, currY + forwardDir) && !board[currY + forwardDir][currX].piece)
        return [{ x: currX, y: currY + forwardDir }];
    return [];
};
const startPushForwardAvaibleCell = (board, currX, currY) => {
    const currPiece = board[currY][currX].piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    if (!currPiece.hasMoved
        && inBoundaries(currX, currY + forwardDir)
        && board[currY + forwardDir][currX].piece === undefined)
        return [{ x: currX, y: currY + 2 * forwardDir }];
    return [];
};
const takeDiagonalForwardAvailableCell = (board, currX, currY) => {
    const currPiece = board[currY][currX].piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    const out = [];
    if (inBoundaries(currX + 1, currY + forwardDir)) {
        const diagRight = board[currY + forwardDir][currX + 1].piece;
        if (diagRight !== undefined && diagRight.color === otherColor(currPiece.color))
            out.push({ x: currX + 1, y: currY + forwardDir });
    }
    if (inBoundaries(currX - 1, currY + forwardDir)) {
        const diagLeft = board[currY + forwardDir][currX - 1].piece;
        if (diagLeft !== undefined && diagLeft.color === otherColor(currPiece.color))
            out.push({ x: currX - 1, y: currY + forwardDir });
    }
    return out;
};
const enPassantAvailableCell = (game, currX, currY) => {
    const board = game.board;
    const currPiece = board[currY][currX].piece;
    const forwardDir = currPiece.color === Color.Black ? 1 : -1;
    const lastMove = game.getLastMove();
    if (lastMove === null)
        return [];
    const lastPieceMoved = lastMove.pieceMoved; // "!" to fix
    const out = [];
    if (inBoundaries(currX + 1, currY + forwardDir) && inBoundaries(currX + 1, currY)) {
        const rightPiece = board[currY][currX + 1].piece;
        if (!board[currY + forwardDir][currX + 1].piece //if no piece on diagonal
            && (rightPiece === null || rightPiece === void 0 ? void 0 : rightPiece.color) === otherColor(currPiece.color) //if opponent's pawn to currPiece side
            && lastPieceMoved.isEquals(rightPiece) //if it is the last piece moved
            && lastPieceMoved.enPassantable //if it just made an en passant
        )
            out.push({ x: currX + 1, y: currY + forwardDir });
    }
    if (inBoundaries(currX - 1, currY + forwardDir) && inBoundaries(currX - 1, currY)) {
        const leftPiece = board[currY][currX - 1].piece;
        if (board[currY + forwardDir][currX - 1].piece === undefined //if no piece on diagonal
            && leftPiece
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
    if (((_a = board[currY][targetX].piece) === null || _a === void 0 ? void 0 : _a.type) === PieceType.Rook && !((_b = board[currY][targetX].piece) === null || _b === void 0 ? void 0 : _b.hasMoved)) {
        //test if no check in between
        const direction = currX > targetX ? -1 : 1;
        for (let offset = 1; Math.abs(currX + direction * offset - targetX) > 0; offset++) {
            if (board[currY][currX + direction * offset].piece !== undefined) //todo : inCheck
                return false;
        }
        return true;
    }
    return false;
};
const availableCells = (game, currX, currY) => {
    var _a, _b;
    const board = game.board;
    let availableCellsList = [];
    //TODO : king in check, etc
    const currPiece = board[currY][currX].piece;
    if (currPiece === undefined)
        return availableCellsList;
    switch (currPiece.type) {
        case PieceType.Pawn:
            availableCellsList = availableCellsList.concat(pushForwardAvaibleCell(board, currX, currY));
            if (availableCells.length > 0) //if forward is available
                availableCellsList = availableCellsList.concat(startPushForwardAvaibleCell(board, currX, currY));
            availableCellsList = availableCellsList.concat(takeDiagonalForwardAvailableCell(board, currX, currY));
            availableCellsList = availableCellsList.concat(enPassantAvailableCell(game, currX, currY));
            break;
        case PieceType.Knight:
            for (let col = -2; col <= 2; col++) {
                for (let row = -2; row <= 2; row++) {
                    if (inBoundaries(currX + row, currY + col)
                        && (Math.abs(col + row) === 3 || Math.abs(col - row) === 3) //if L-shape
                        && ((_a = board[currY + col][currX + row].piece) === null || _a === void 0 ? void 0 : _a.color) !== currPiece.color) //if not taking own pieces
                        availableCellsList.push({ x: currX + row, y: currY + col });
                }
            }
            break;
        case PieceType.Rook:
            availableCellsList = straightAvailableCells(board, currX, currY);
            break;
        case PieceType.Queen:
            availableCellsList = straightAvailableCells(board, currX, currY).concat(diagAvailableCells(board, currX, currY));
            break;
        case PieceType.Bishop:
            availableCellsList = diagAvailableCells(board, currX, currY);
            break;
        case PieceType.King: //Todo castle
            for (let row = currY - 1; row <= currY + 1; row++) {
                for (let col = currX - 1; col <= currX + 1; col++) {
                    if (inBoundaries(col, row) && !board[row][col].inCheckBy.has(otherColor(currPiece.color)) && ((_b = board[row][col].piece) === null || _b === void 0 ? void 0 : _b.color) !== currPiece.color)
                        availableCellsList.push({ x: col, y: row });
                }
            }
            if (!currPiece.hasMoved) {
                if (isCastlePossible(board, currX, currY, 0))
                    availableCellsList.push({ x: currX - 2, y: currY }); //left side castle
                if (isCastlePossible(board, currX, currY, 7))
                    availableCellsList.push({ x: currX + 2, y: currY }); //right side castle
            }
            break;
        default:
            throw new Error("Unreachable");
    }
    return availableCellsList;
};
const removePiece = (board, x, y) => {
    const oldCell = board[y][x];
    const piece = oldCell.piece;
    if (piece === undefined)
        return;
    oldCell.piece = undefined;
};
const boardMovePiece = (board, oldX, oldY, targetX, targetY) => {
    //Only manages changing the position of a piece on the board, regardless of other aspects, for that, see movePiece.
    board[targetY][targetX].piece = game.board[oldY][oldX].piece; //new cell
    board[oldY][oldX].piece = undefined; //old cell
};
const promotion = (piece, newPieceType) => {
    piece.type = newPieceType;
    piece.image = getImage(piece.color, newPieceType);
};
const movePiece = (game, oldX, oldY, newX, newY) => __awaiter(void 0, void 0, void 0, function* () {
    clearMessage();
    const piece = game.board[oldY][oldX].piece;
    if (piece === undefined)
        return; //empty cell
    //Check if right player's turn
    if (piece.color !== game.turn) {
        message("It's not your turn!");
        return;
    }
    //Check if newCoords is in available cells
    if (!availableCells(game, oldX, oldY).some((coords_elt) => { return coords_elt.x === newX && coords_elt.y === newY; })) {
        message("This square is unavailable!");
        return;
    }
    //Test if pawn moved 2 cells
    piece.enPassantable = (piece.type === PieceType.Pawn && !piece.hasMoved && Math.abs(newY - oldY) === 2); //if it's pawn's first move two cells forwards.
    //Test if promotion
    if (piece.type === PieceType.Pawn && [0, 7].includes(newY)) {
        const prom = new Promotion(piece.color, newX, newY, newY == 0 ? 1 : -1);
        toDraw.add(prom);
        // promotion(piece, PieceType.Queen); //auto-promote to queen : temporary.
        promotion(piece, yield choosePromotion(prom));
        toDraw.delete(prom);
    }
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
        && game.board[newY][newX].piece === undefined //diagonal but no piece on the target cell
    ) {
        move = new Move(game, oldX, oldY, newX, newY, newX, oldY);
        removePiece(game.board, newX, oldY); //remove en passant-ed pawn
    }
    else {
        move = new Move(game, oldX, oldY, newX, newY);
    }
    boardMovePiece(game.board, oldX, oldY, newX, newY);
    game.moves.push(move);
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
