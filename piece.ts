enum Color { 
    None,
    Black,
    White,
}

const otherColor = (color:Color) : Color => {
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

enum PieceType {
    None,
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
    pieceType: PieceType;
    hasMoved : boolean;
    enPassantable : boolean;
    id : number;
    image? : HTMLImageElement;
    constructor(color : Color = Color.None, pieceType : PieceType = PieceType.None) {
        this.color = color
        this.pieceType = pieceType
        this.hasMoved = false
        this.enPassantable = false
        this.id = Piece.numPieces++
        if (color != Color.None || pieceType != PieceType.None) {
            const img : HTMLImageElement = getImage(color, pieceType)
            img.onload = () => { //TODO : fix image loading
                this.image = img;
            }
            
        }
    }
    isEquals(otherPiece : Piece) {
        return (this.id === otherPiece.id)
    }
}
