const toDraw : Set<any> = new Set();

const msg = document.querySelector("#msg") as HTMLParagraphElement;

function message(text : string) : void {
    msg.innerHTML = text;
}

function clearMessage() : void {
    msg.innerHTML = "&nbsp;"; //Default message
}

const canvas = document.querySelector("#board") as HTMLCanvasElement;

canvas.oncontextmenu = (event : Event) => {
    event.preventDefault();
};

let width : number = canvas.width;
let height : number = canvas.height;

let squareSize : number = width / 8;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

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
const darkSquare  = "#364";
const bgColor     = "#999";

const markColor      = "rgba(0, 96, 256, 0.5)";
const availableColor = "rgba(0, 256, 96, 0.5)";

const img_prefix = "./img/Chess_"
const img_suffix = "t45.svg"

function getImageUrl(color : Color, pieceType : PieceType) : string {
    const color_suffix = (color === Color.Black ? "d" : "l");
    switch (pieceType) {
        case PieceType.King  : return img_prefix + "k" + color_suffix + img_suffix;
        case PieceType.Queen : return img_prefix + "q" + color_suffix + img_suffix;
        case PieceType.Rook  : return img_prefix + "r" + color_suffix + img_suffix;
        case PieceType.Bishop: return img_prefix + "b" + color_suffix + img_suffix;
        case PieceType.Knight: return img_prefix + "n" + color_suffix + img_suffix;
        case PieceType.Pawn  : return img_prefix + "p" + color_suffix + img_suffix;
        default: throw new Error("Unreachable");
    }
}

function getImageFromUrl(image_url : string) : HTMLImageElement {
    const img : HTMLImageElement = new Image();
    img.src = image_url;
    return img;
}


function getImage(color : Color, pieceType : PieceType) : HTMLImageElement{
    return getImageFromUrl(getImageUrl(color, pieceType));
}

function drawBoardBg () : void {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = ((i+j)%2) ? darkSquare : lightSquare;
            ctx.fillRect(i*squareSize, j*squareSize, squareSize, squareSize);
        }
    }
}

async function drawPieceGrid (piece : Piece, y:number, x:number, bg?:string) : Promise<void> {
    await piece.image.decode();
    if (bg !== undefined) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
    }
    ctx.drawImage(piece.image, x*squareSize, y*squareSize, squareSize, squareSize);
}

async function drawPieceAt (piece : Piece, y : number, x : number) : Promise<void> {
    await piece.image.decode();
    ctx.drawImage(piece.image, x, y, squareSize, squareSize);
}

function drawPromotion (prom : Promotion): void {
    drawPieceGrid(new Piece(prom.color, PieceType.Queen, undefined, undefined, false), prom.queenY, prom.file, bgColor)
    drawPieceGrid(new Piece(prom.color, PieceType.Rook, undefined, undefined, false), prom.rookY, prom.file, bgColor)
    drawPieceGrid(new Piece(prom.color, PieceType.Bishop, undefined, undefined, false), prom.bishopY, prom.file, bgColor)
    drawPieceGrid(new Piece(prom.color, PieceType.Knight, undefined, undefined, false), prom.knightY, prom.file, bgColor)
}

function drawBoard (game : Game, playerColor : Color) : void {
    switch (playerColor) {
        case Color.White:
            for (const piece of game.whitePieces) {
                if (piece.x !== undefined 
                    && piece.y !== undefined
                     && (
                        !game.selecting
                        || (game.selecting 
                            && game.selectedCell !== null 
                            && game.selectedCell.piece !== undefined 
                            && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                    )    
                ) {
                    drawPieceGrid(piece, piece.y, piece.x);
                }
            }
            for (const piece of game.blackPieces) {
                if (piece.x !== undefined 
                    && piece.y !== undefined 
                    && (
                        !game.selecting
                        || (game.selecting 
                            && game.selectedCell !== null 
                            && game.selectedCell.piece !== undefined 
                            && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                    )    
                ) {
                    drawPieceGrid(piece, piece.y, piece.x);
                }
            }
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const cell = game.board.at(y, x)!;
                    
                    if (cell.marked) {
                        colorCell(x, y, markColor);
                    }
                    if (cell.available) {
                        colorCell(x, y, availableColor);
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80");
                    // }
                }
            }
        break;
        case Color.Black:
            for (const piece of game.whitePieces) {
                if (piece.x !== undefined 
                    && piece.y !== undefined 
                    && (
                        !game.selecting
                        || (
                            game.selecting 
                            && game.selectedCell !== null 
                            && game.selectedCell.piece !== undefined 
                            && !game.selectedCell.piece.isEquals(piece)) //don't draw the selected piece
                    )    
                ) {
                    drawPieceGrid(piece, 7-piece.y, 7-piece.x);
                }
            }
            for (const piece of game.blackPieces) {
                if (piece.x !== undefined 
                    && piece.y !== undefined 
                    && (
                        !game.selecting
                        || (
                            game.selecting 
                            && game.selectedCell !== null
                            && game.selectedCell.piece !== undefined 
                            && !game.selectedCell.piece.isEquals(piece)
                            ) //don't draw the selected piece
                        )    
                ) {
                    drawPieceGrid(piece, 7-piece.y, 7-piece.x);
                }
            }
            for (let y:number = 0; y < 8; y++) {
                for (let x:number = 0; x < 8; x++) {
                    const cell = game.board.at(y, x)!;
                    
                    if (cell.marked) {
                        colorCell(7-x, 7-y, markColor);
                    }
                    if (cell.available) {
                        colorCell(7-x, 7-y, availableColor);
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80");
                    // }
                }
            }
        break;
        default:
            throw new Error("unreachable");
    }
}

function colorCell (x:number, y:number, color:string):void {
    ctx.fillStyle = color;
    ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
}

//Draw
function updateView():void {
    drawBoardBg();
    drawBoard(game, playerview);

    for (const elt of toDraw) {
        if (elt instanceof Promotion) {
            drawPromotion(elt);
        }
    }

}