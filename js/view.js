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
const toDraw = new Set();
const msg = document.querySelector("#msg");
function message(text) {
    msg.innerHTML = text;
}
function clearMessage() {
    msg.innerHTML = "&nbsp;"; //Default message
}
const canvas = document.querySelector("#board");
canvas.oncontextmenu = function (event) {
    event.preventDefault();
};
let width = canvas.width;
let height = canvas.height;
let squareSize = width / 8;
const ctx = canvas.getContext("2d");
// window.addEventListener("resize", (event) => {
//     const size = Math.min(window.screen.width, window.screen.height)
//     canvas.width = Math.floor(0.7 * size / 8) * 8
//     canvas.height = Math.floor(0.7 * size/ 8) * 8
//     width = canvas.width;
//     height = canvas.height;
//     squareSize = Math.floor(width / 8);
//     // ctx = canvas.getContext("2d") as CanvasRenderingContext2D
//     update()
// })
const lightSquare = "#eec";
const darkSquare = "#364";
const bgColor = "#999";
const markColor = "rgba(0, 96, 256, 0.5)";
const availableColor = "rgba(0, 256, 96, 0.5)";
const img_prefix = "./img/Chess_";
const img_suffix = "t45.svg";
const getImageUrl = (color, pieceType) => {
    switch (color) {
        case Color.Black:
            switch (pieceType) {
                case PieceType.King: return img_prefix + "kd" + img_suffix;
                case PieceType.Queen: return img_prefix + "qd" + img_suffix;
                case PieceType.Rook: return img_prefix + "rd" + img_suffix;
                case PieceType.Bishop: return img_prefix + "bd" + img_suffix;
                case PieceType.Knight: return img_prefix + "nd" + img_suffix;
                case PieceType.Pawn: return img_prefix + "pd" + img_suffix;
                default: throw new Error("Unreachable");
            }
        case Color.White:
            switch (pieceType) {
                case PieceType.King: return img_prefix + "kl" + img_suffix;
                case PieceType.Queen: return img_prefix + "ql" + img_suffix;
                case PieceType.Rook: return img_prefix + "rl" + img_suffix;
                case PieceType.Bishop: return img_prefix + "bl" + img_suffix;
                case PieceType.Knight: return img_prefix + "nl" + img_suffix;
                case PieceType.Pawn: return img_prefix + "pl" + img_suffix;
                default: throw new Error("Unreachable");
            }
        default: throw new Error("Unreachable");
    }
};
const getImageFromUrl = (image_url) => {
    const img = new Image();
    img.src = image_url;
    return img;
};
const getImage = (color, pieceType) => {
    return getImageFromUrl(getImageUrl(color, pieceType));
};
const drawBoardBg = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = ((i + j) % 2) ? darkSquare : lightSquare;
            ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
        }
    }
};
const drawPieceGrid = (piece, y, x, bg) => __awaiter(void 0, void 0, void 0, function* () {
    yield piece.image.decode();
    if (bg !== undefined) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
    ctx.drawImage(piece.image, x * squareSize, y * squareSize, squareSize, squareSize);
});
const drawPieceAt = (piece, y, x) => __awaiter(void 0, void 0, void 0, function* () {
    yield piece.image.decode();
    ctx.drawImage(piece.image, x, y, squareSize, squareSize);
});
const drawPromotion = (prom) => {
    drawPieceGrid(new Piece(prom.color, PieceType.Queen, undefined, undefined, false), prom.queenY, prom.file, bgColor);
    drawPieceGrid(new Piece(prom.color, PieceType.Rook, undefined, undefined, false), prom.rookY, prom.file, bgColor);
    drawPieceGrid(new Piece(prom.color, PieceType.Bishop, undefined, undefined, false), prom.bishopY, prom.file, bgColor);
    drawPieceGrid(new Piece(prom.color, PieceType.Knight, undefined, undefined, false), prom.knightY, prom.file, bgColor);
};
const drawBoard = (game, playerColor) => {
    switch (playerColor) {
        case Color.White:
            for (const piece of game.whitePieces) {
                if (piece.x !== undefined && piece.y !== undefined && (!game.selecting
                    || (game.selecting && game.selectedCell !== null && game.selectedCell.piece !== undefined && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                )) {
                    drawPieceGrid(piece, piece.y, piece.x);
                }
            }
            for (const piece of game.blackPieces) {
                if (piece.x !== undefined && piece.y !== undefined && (!game.selecting
                    || (game.selecting && game.selectedCell !== null && game.selectedCell.piece !== undefined && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                )) {
                    drawPieceGrid(piece, piece.y, piece.x);
                }
            }
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const cell = game.board.at(y, x);
                    if (cell.marked) {
                        colorCell(x, y, markColor);
                    }
                    if (cell.available) {
                        colorCell(x, y, availableColor);
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80")
                    // }
                }
            }
            break;
        case Color.Black:
            for (const piece of game.whitePieces) {
                if (piece.x !== undefined && piece.y !== undefined && (!game.selecting
                    || (game.selecting && game.selectedCell !== null && game.selectedCell.piece !== undefined && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                )) {
                    drawPieceGrid(piece, 7 - piece.y, 7 - piece.x);
                }
            }
            for (const piece of game.blackPieces) {
                if (piece.x !== undefined && piece.y !== undefined && (!game.selecting
                    || (game.selecting && game.selectedCell !== null && game.selectedCell.piece !== undefined && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                )) {
                    drawPieceGrid(piece, 7 - piece.y, 7 - piece.x);
                }
            }
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const cell = game.board.at(y, x);
                    if (cell.marked) {
                        colorCell(7 - x, 7 - y, markColor);
                    }
                    if (cell.available) {
                        colorCell(7 - x, 7 - y, availableColor);
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80")
                    // }
                }
            }
            break;
        default:
            throw new Error("unreachable");
    }
};
const colorCell = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
};
//Draw
function updateView() {
    drawBoardBg();
    drawBoard(game, playerview);
    for (const elt of toDraw) {
        if (elt instanceof Promotion) {
            drawPromotion(elt);
        }
    }
}
