enum Color {
    Black,
    White,
}

const otherColor = (color:Color) : Color => {
    switch (color) {
        case Color.Black:
            return Color.White
        case Color.White:
            return Color.Black
        default:
            throw new Error("unreachable")
    }
}

enum PieceType {
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
}

class Piece {
    static numPieces:number = 0;
    color: Color;
    type: PieceType;
    hasMoved : boolean;
    enPassantable : boolean;
    isOut : boolean;
    x ?: number;
    y ?: number;
    id ?: number;
    image : HTMLImageElement;
    constructor(color : Color, pieceType : PieceType, x?: number, y?:number, hasID : boolean = true) {
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
    
    isEquals(otherPiece : Piece) {
        if (this.id !== undefined || otherPiece.id !== undefined) return false;
        return (this.id === otherPiece.id);
    }
}
