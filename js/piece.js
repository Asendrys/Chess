"use strict";
var Color;
(function (Color) {
    Color[Color["Black"] = 0] = "Black";
    Color[Color["White"] = 1] = "White";
})(Color || (Color = {}));
;
function otherColor(color) {
    switch (color) {
        case Color.Black:
            return Color.White;
        case Color.White:
            return Color.Black;
        default:
            throw new Error("unreachable");
    }
}
var PieceType;
(function (PieceType) {
    PieceType[PieceType["King"] = 0] = "King";
    PieceType[PieceType["Queen"] = 1] = "Queen";
    PieceType[PieceType["Rook"] = 2] = "Rook";
    PieceType[PieceType["Bishop"] = 3] = "Bishop";
    PieceType[PieceType["Knight"] = 4] = "Knight";
    PieceType[PieceType["Pawn"] = 5] = "Pawn";
})(PieceType || (PieceType = {}));
;
class Piece {
    constructor(color, pieceType, x, y, hasID = true) {
        this.color = color;
        this.type = pieceType;
        this.x = x;
        this.y = y;
        this.hasMoved = false;
        this.enPassantable = false;
        this.isOut = false;
        if (hasID)
            this.id = Piece.numPieces++;
        this.image = getImage(color, pieceType);
    }
    copy() {
        return new Piece(this.color, this.type, this.x, this.y, false);
    }
    isEquals(otherPiece) {
        if (this.id === undefined || otherPiece.id === undefined)
            return false;
        return (this.id === otherPiece.id);
    }
}
Piece.numPieces = 0;
;
