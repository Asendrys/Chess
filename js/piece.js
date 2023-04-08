"use strict";
var Color;
(function (Color) {
    Color[Color["None"] = 0] = "None";
    Color[Color["Black"] = 1] = "Black";
    Color[Color["White"] = 2] = "White";
})(Color || (Color = {}));
const otherColor = (color) => {
    switch (color) {
        case Color.None:
            return Color.None;
        case Color.Black:
            return Color.White;
        case Color.White:
            return Color.Black;
        default:
            throw new Error("unreachable");
    }
};
var PieceType;
(function (PieceType) {
    PieceType[PieceType["None"] = 0] = "None";
    PieceType[PieceType["King"] = 1] = "King";
    PieceType[PieceType["Queen"] = 2] = "Queen";
    PieceType[PieceType["Rook"] = 3] = "Rook";
    PieceType[PieceType["Bishop"] = 4] = "Bishop";
    PieceType[PieceType["Knight"] = 5] = "Knight";
    PieceType[PieceType["Pawn"] = 6] = "Pawn";
})(PieceType || (PieceType = {}));
class Piece {
    constructor(color = Color.None, pieceType = PieceType.None) {
        this.color = color;
        this.pieceType = pieceType;
        this.hasMoved = false;
        this.enPassantable = false;
        this.id = Piece.numPieces++;
        if (color != Color.None || pieceType != PieceType.None) {
            const img = getImage(color, pieceType);
            img.onload = () => {
                this.image = img;
            };
        }
    }
    isEquals(otherPiece) {
        return (this.id === otherPiece.id);
    }
}
Piece.numPieces = 0;
