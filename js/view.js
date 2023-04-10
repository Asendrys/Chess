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
const width = canvas.width;
const height = canvas.height;
const squareSize = width / 8;
const ctx = canvas.getContext("2d");
// ctx.canvas.width  = window.innerWidth;
// ctx.canvas.height = window.innerHeight;
const lightSquare = "#eec";
const darkSquare = "#364";
const bgColor = "#999";
const markColor = "rgba(0, 96, 256, 0.5)";
const availableColor = "rgba(0, 256, 96, 0.5)";
const img_prefix = "./img/Chess_";
const img_suffix = "t45.svg";
// const images_url : Object = {
//     Color.Black: {
//         PieceType.King: img_prefix + "kd" + img_suffix,
//         PieceType.Queen: img_prefix + "qd" + img_suffix,
//         PieceType.Rook: img_prefix + "rd" + img_suffix,
//         PieceType.Bishop: img_prefix + "bd" + img_suffix,
//         PieceType.Knight: img_prefix + "nd" + img_suffix,
//         PieceType.Pawn: img_prefix + "pd" + img_suffix,
//     }, 
//     Color.White: {
//         PieceType.King: img_prefix + "kl" + img_suffix,
//         PieceType.Queen: img_prefix + "ql" + img_suffix,
//         PieceType.Rook: img_prefix + "rl" + img_suffix,
//         PieceType.Bishop: img_prefix + "bl" + img_suffix,
//         PieceType.Knight: img_prefix + "nl" + img_suffix,
//         PieceType.Pawn: img_prefix + "pl" + img_suffix,
//     }
// }
const images_url = {
    [Color.Black]: {
        [PieceType.King]: img_prefix + "kd" + img_suffix,
        [PieceType.Queen]: img_prefix + "qd" + img_suffix,
        [PieceType.Rook]: img_prefix + "rd" + img_suffix,
        [PieceType.Bishop]: img_prefix + "bd" + img_suffix,
        [PieceType.Knight]: img_prefix + "nd" + img_suffix,
        [PieceType.Pawn]: img_prefix + "pd" + img_suffix,
    },
    [Color.White]: {
        [PieceType.King]: img_prefix + "kl" + img_suffix,
        [PieceType.Queen]: img_prefix + "ql" + img_suffix,
        [PieceType.Rook]: img_prefix + "rl" + img_suffix,
        [PieceType.Bishop]: img_prefix + "bl" + img_suffix,
        [PieceType.Knight]: img_prefix + "nl" + img_suffix,
        [PieceType.Pawn]: img_prefix + "pl" + img_suffix,
    }
};
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
            break;
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
            break;
        default: throw new Error("Unreachable");
    }
};
const getImageFromUrl = (image_url) => {
    const img = new Image();
    img.src = image_url;
    // img.decode().then();
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
const drawPromotion = (prom) => __awaiter(void 0, void 0, void 0, function* () {
    yield drawPieceGrid(new Piece(prom.color, PieceType.Queen, false), prom.queenY, prom.file, bgColor);
    yield drawPieceGrid(new Piece(prom.color, PieceType.Rook, false), prom.rookY, prom.file, bgColor);
    yield drawPieceGrid(new Piece(prom.color, PieceType.Bishop, false), prom.bishopY, prom.file, bgColor);
    yield drawPieceGrid(new Piece(prom.color, PieceType.Knight, false), prom.knightY, prom.file, bgColor);
});
const drawBoard = (game, playerColor) => {
    switch (playerColor) {
        case Color.White:
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const cell = game.board[y][x];
                    if (cell.marked) {
                        colorCell(x, y, markColor);
                    }
                    if (cell.available) {
                        colorCell(x, y, availableColor);
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80")
                    // }
                    if (cell.piece !== undefined)
                        drawPieceGrid(cell.piece, y, x);
                }
            }
            // for (const piece of game.pieces) {
            //     drawPieceGrid(piece.color, piece.type, piece.y, piece.x)
            // }
            break;
        case Color.Black:
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const cell = game.board[y][x];
                    if (cell.marked) {
                        colorCell(7 - x, 7 - y, markColor);
                    }
                    if (cell.available) {
                        colorCell(7 - x, 7 - y, availableColor);
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80")
                    // }
                    if (cell.piece !== undefined)
                        drawPieceGrid(cell.piece, 7 - y, 7 - x);
                }
            }
            // for (const piece of game.pieces) {
            //     drawPieceGrid(piece.color, piece.type, piece.y, piece.x)
            // }
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
