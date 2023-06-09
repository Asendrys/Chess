type coords = {x:number, y:number};

class Cell {
    y : number;
    x : number;
    piece ?: Piece;
    selected : boolean;
    marked : boolean;
    available : boolean;

    constructor(x : number, y : number, piece ?: Piece) {
        this.y = y; //Row index
        this.x = x; //Column index
        this.piece = piece;
        this.selected = false;
        this.marked = false;
        this.available = false;
    }

    copy() : Cell {
        if (this.piece === undefined) return new Cell(this.y, this.x);
        return new Cell(this.y, this.x, this.piece.copy());
    }
}

function defaultBoardPieces() : Piece[] {
    const pieces : Piece[] = [];
    pieces.push(new Piece(Color.Black, PieceType.Rook, 0, 0));
    pieces.push(new Piece(Color.Black, PieceType.Knight, 1, 0));
    pieces.push(new Piece(Color.Black, PieceType.Bishop, 2, 0));
    pieces.push(new Piece(Color.Black, PieceType.Queen, 3, 0));
    pieces.push(new Piece(Color.Black, PieceType.King, 4, 0));
    pieces.push(new Piece(Color.Black, PieceType.Bishop, 5, 0));
    pieces.push(new Piece(Color.Black, PieceType.Knight, 6, 0));
    pieces.push(new Piece(Color.Black, PieceType.Rook, 7, 0));

    pieces.push(new Piece(Color.White, PieceType.Rook, 0, 7));
    pieces.push(new Piece(Color.White, PieceType.Knight, 1, 7));
    pieces.push(new Piece(Color.White, PieceType.Bishop, 2, 7));
    pieces.push(new Piece(Color.White, PieceType.Queen, 3, 7));
    pieces.push(new Piece(Color.White, PieceType.King, 4, 7));
    pieces.push(new Piece(Color.White, PieceType.Bishop, 5, 7));
    pieces.push(new Piece(Color.White, PieceType.Knight, 6, 7));
    pieces.push(new Piece(Color.White, PieceType.Rook, 7, 7));

    for (let col = 0; col < 8 ; col++) {
        pieces.push(new Piece(Color.Black, PieceType.Pawn, col, 1));
        pieces.push(new Piece(Color.White, PieceType.Pawn, col, 6));
    }
    return pieces;
}

class Board {
    elts : Array<Array<Cell>>;

    constructor(elts ?: Array<Array<Cell>>, boardPieces : Piece[] = defaultBoardPieces()) {
        if (elts !== undefined) {
            this.elts = elts;
            return;
        }
        this.elts = Array(8).fill(null);
        for (let row = 0; row < 8 ; row++) {
            this.elts[row] = Array(8).fill(null);
            for (let col = 0; col < 8; col++) {
                this.elts[row][col] = new Cell(col, row);
            }
        }
        this.fill(boardPieces);
    }

    fill(pieces : Piece[]) : void {
        for (const piece of pieces) {
            const row = piece.y!;
            const col = piece.x!;
            this.elts[row][col].piece = piece;
        }
    }

    // at(y:number, x:number) : Cell|undefined {
    //     if (!inBoundaries(x, y))
    //         return;
    //     return this.elts[y][x];
    // }

    
    at(y:number, x:number) : Cell | undefined{
        if (!inBoundaries(x, y))
            return; //throw new Error("outside boundaries");
        return this.elts[y][x];
    }

    copy() : Board {
        const eltsCopy : Array<Array<Cell>> = Array(8).fill(null);
        for (let i = 0; i < 8; i++) {
            eltsCopy[i] = Array(8).fill(null);
            for (let j = 0; j < 8; j++) {
                eltsCopy[i][j] = this.elts[i][j].copy();
            }
        }
        return new Board(eltsCopy);
    }
    
};

// type coord = 0|1|2|3|4|5|6|7;

function inBoundaries(x : number, y : number) : boolean {
    return 0 <= x && x < 8 && 0 <= y && y < 8;
}