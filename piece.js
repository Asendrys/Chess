const Color = { 
    None: "nonecolor",
    Black: "black",
    White: "white",
}

otherColor = (color) => {
    switch (color) {
        case Color.None:
            return Color.None
        case Color.Black:
            return Color.White
        case Color.White:
            return Color.Black
        default:
            throw new Error("unreachable")
    }
}

const PieceType = {
    None: "none",
    King: "king",
    Queen: "queen",
    Rook: "rook",
    Bishop: "bishop",
    Knight: "knight", 
    Pawn: "pawn",
}

class Piece {
    static numPieces = 0;
    constructor(color = Color.None, pieceType = PieceType.None) {
        this.color = color
        this.pieceType = pieceType
        this.hasMoved = false
        this.enPassantable = false
        this.id = Piece.numPieces++
    }
    isEquals(otherPiece) {
        return (this.id === otherPiece.id)
    }
}
