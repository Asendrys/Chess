const toDraw : Set<any> = new Set()

const msg = document.querySelector("#msg") as HTMLParagraphElement

function message(text : string) : void {
    msg.innerHTML = text
}

function clearMessage() : void {
    msg.innerHTML = "&nbsp;" //Default message
}

const canvas = document.querySelector("#board") as HTMLCanvasElement

canvas.oncontextmenu = function (event) {
    event.preventDefault();
};

const width : number = canvas.width;
const height : number = canvas.height;

const squareSize : number = width / 8;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

// ctx.canvas.width  = window.innerWidth;
// ctx.canvas.height = window.innerHeight;

const lightSquare : string = "#eec";
const darkSquare : string = "#364";
const bgColor : string = "#999";

const markColor : string = "rgba(0, 96, 256, 0.5)";
const availableColor : string = "rgba(0, 256, 96, 0.5)";


const img_prefix : string = "./img/Chess_"
const img_suffix : string = "t45.svg"

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

const images_url : {[col in Color]?: {[pt in PieceType]?: string} } = {
    [Color.Black]: {
        [PieceType.King]    : img_prefix + "kd" + img_suffix,
        [PieceType.Queen]   : img_prefix + "qd" + img_suffix,
        [PieceType.Rook]    : img_prefix + "rd" + img_suffix,
        [PieceType.Bishop]  : img_prefix + "bd" + img_suffix,
        [PieceType.Knight]  : img_prefix + "nd" + img_suffix,
        [PieceType.Pawn]    : img_prefix + "pd" + img_suffix,
    },
    [Color.White]: {
        [PieceType.King]    : img_prefix + "kl" + img_suffix,
        [PieceType.Queen]   : img_prefix + "ql" + img_suffix,
        [PieceType.Rook]    : img_prefix + "rl" + img_suffix,
        [PieceType.Bishop]  : img_prefix + "bl" + img_suffix,
        [PieceType.Knight]  : img_prefix + "nl" + img_suffix,
        [PieceType.Pawn]    : img_prefix + "pl" + img_suffix,
    }
}

const getImageUrl = (color : Color, pieceType : PieceType) : string => {
    switch (color) {
    case Color.Black:
        switch (pieceType) {
            case PieceType.King  : return img_prefix + "kd" + img_suffix;
            case PieceType.Queen : return img_prefix + "qd" + img_suffix;
            case PieceType.Rook  : return img_prefix + "rd" + img_suffix;
            case PieceType.Bishop: return img_prefix + "bd" + img_suffix;
            case PieceType.Knight: return img_prefix + "nd" + img_suffix;
            case PieceType.Pawn  : return img_prefix + "pd" + img_suffix;
            default: throw new Error("Unreachable");
        }
        break;
    case Color.White:
        switch (pieceType) {
            case PieceType.King  : return img_prefix + "kl" + img_suffix;
            case PieceType.Queen : return img_prefix + "ql" + img_suffix;
            case PieceType.Rook  : return img_prefix + "rl" + img_suffix;
            case PieceType.Bishop: return img_prefix + "bl" + img_suffix;
            case PieceType.Knight: return img_prefix + "nl" + img_suffix;
            case PieceType.Pawn  : return img_prefix + "pl" + img_suffix;
            default: throw new Error("Unreachable");
        }
        break;
    default: throw new Error("Unreachable");
    }
}

const getImageFromUrl = (image_url : string) : HTMLImageElement => {
    const img : HTMLImageElement = new Image()
    img.src = image_url;
    // img.decode().then();
    
    return img;
}


const getImage = (color : Color, pieceType : PieceType) : HTMLImageElement => {
    return getImageFromUrl(getImageUrl(color, pieceType));
}

const drawBoardBg = () : void => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = ((i+j)%2) ? darkSquare : lightSquare;
            ctx.fillRect(i*squareSize, j*squareSize, squareSize, squareSize);
        }
    }
}

const drawPieceGrid = async (piece : Piece, y:number, x:number, bg?:string) : Promise<void> => {

    await piece.image.decode()
    if (bg !== undefined) {
        ctx.fillStyle = bgColor
        ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
    }
    ctx.drawImage(piece.image, x*squareSize, y*squareSize, squareSize, squareSize)
}

const drawPieceAt = async (piece : Piece, y : number, x : number) : Promise<void> => {
    await piece.image.decode()
    ctx.drawImage(piece.image, x, y, squareSize, squareSize)
}

const drawPromotion = async (prom : Promotion): Promise<void> => {
    await drawPieceGrid(new Piece(prom.color, PieceType.Queen, undefined, undefined, false), prom.queenY, prom.file, bgColor)
    await drawPieceGrid(new Piece(prom.color, PieceType.Rook, undefined, undefined, false), prom.rookY, prom.file, bgColor)
    await drawPieceGrid(new Piece(prom.color, PieceType.Bishop, undefined, undefined, false), prom.bishopY, prom.file, bgColor)
    await drawPieceGrid(new Piece(prom.color, PieceType.Knight, undefined, undefined, false), prom.knightY, prom.file, bgColor)
}

const drawBoard = (game : Game, playerColor : Color) : void => {
    switch (playerColor) {
        case Color.White:
            game.whitePieces.forEach( (piece : Piece) => {
                if (piece.x !== undefined && piece.y !== undefined)
                drawPieceGrid(piece, piece.y, piece.x);
            })
            game.blackPieces.forEach( (piece : Piece) => {
                if (piece.x !== undefined && piece.y !== undefined)
                drawPieceGrid(piece, piece.y, piece.x);
            })
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const cell = game.board.at(y, x)!
                    
                    if (cell.marked) {
                        colorCell(x, y, markColor)
                    }
                    if (cell.available) {
                        colorCell(x, y, availableColor)
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80")
                    // }
                    if (cell.piece !== undefined)
                        drawPieceGrid(cell.piece, y, x)
                }
            }
            // for (const piece of game.pieces) {
            //     drawPieceGrid(piece.color, piece.type, piece.y, piece.x)
            // }
        break;
        case Color.Black:
            game.whitePieces.forEach( (piece : Piece) => {
                if (piece.x !== undefined && piece.y !== undefined)
                drawPieceGrid(piece, 7-piece.y, 7-piece.x);
            })
            game.blackPieces.forEach( (piece : Piece) => {
                if (piece.x !== undefined && piece.y !== undefined)
                drawPieceGrid(piece, 7-piece.y, 7-piece.x);
            })
            for (let y:number = 0; y < 8; y++) {
                for (let x:number = 0; x < 8; x++) {
                    const cell = game.board.at(y, x)!
                    
                    if (cell.marked) {
                        colorCell(7-x, 7-y, markColor)
                    }
                    if (cell.available) {
                        colorCell(7-x, 7-y, availableColor)
                    }
                    // if (cell.piece.hasMoved) {
                    //     colorCell(x, y, "#f80")
                    // }
                    // if (cell.piece !== undefined)
                    //     drawPieceGrid(cell.piece, 7-y, 7-x)
                }
            }
            // for (const piece of game.pieces) {
            //     drawPieceGrid(piece.color, piece.type, piece.y, piece.x)
            // }
        break;
        default:
            throw new Error("unreachable")
    }
}

const colorCell = (x:number, y:number, color:string):void => {
    ctx.fillStyle = color;
    ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
}

//Draw
function updateView():void {
    drawBoardBg()
    drawBoard(game, playerview)

    for (const elt of toDraw) {
        if (elt instanceof Promotion) {
            drawPromotion(elt)
        }
    }

}