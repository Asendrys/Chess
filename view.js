//Notation


//Views

const canvas = document.querySelector("#board")

canvas.oncontextmenu = function (event) {
    event.preventDefault();
};

const width = canvas.width;
const height = canvas.height;

const squareSize = width / 8;

const ctx = canvas.getContext("2d")

// ctx.canvas.width  = window.innerWidth;
// ctx.canvas.height = window.innerHeight;

const lightSquare = "#eec";
const darkSquare = "#364";

const markColor = "rgba(0, 96, 256, 0.5)";
const availableColor = "rgba(0, 256, 96, 0.5)";


const img_prefix = "./img/Chess_"
const img_suffix = "t45.svg"

const images_url = {
    black: {
        king: img_prefix + "kd" + img_suffix,
        queen: img_prefix + "qd" + img_suffix,
        rook: img_prefix + "rd" + img_suffix,
        bishop: img_prefix + "bd" + img_suffix,
        knight: img_prefix + "nd" + img_suffix,
        pawn: img_prefix + "pd" + img_suffix,
    }, 
    white: {
        king: img_prefix + "kl" + img_suffix,
        queen: img_prefix + "ql" + img_suffix,
        rook: img_prefix + "rl" + img_suffix,
        bishop: img_prefix + "bl" + img_suffix,
        knight: img_prefix + "nl" + img_suffix,
        pawn: img_prefix + "pl" + img_suffix,
    }
}

let images = {}
for (const color of Object.keys(images_url) ) {
    let images_col = {}
    for (const piecetype of Object.keys(images_url[color])) {
        const img = new Image()
        img.src = images_url[color][piecetype]
        img.onload = () => {
            images_col[piecetype] = img
        }
    }
    images[color] = images_col
}

drawBoardBg = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = ((i+j)%2) ? darkSquare : lightSquare;
            ctx.fillRect(i*squareSize, j*squareSize, squareSize, squareSize);
        }
    }
}

drawPieceGrid = (color, pieceType, y, x) => {
    ctx.drawImage(images[color][pieceType], x*squareSize, y*squareSize, squareSize, squareSize)
}

drawPieceAt = (color, piece, y, x) => {
    const img = new Image()
    img.src = images[color][piece]
    img.onload = () => {
        ctx.drawImage(img, x, y, squareSize, squareSize)
    }
}

drawBoard = (game) => {
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = game.board[y][x]
            if (cell.piece.pieceType !== PieceType.None && cell.piece.color != Color.None)
                drawPieceGrid(cell.piece.color, cell.piece.pieceType, y, x)
        }
    }
    // for (const piece of game.pieces) {
    //     drawPieceGrid(piece.color, piece.pieceType, piece.y, piece.x)
    // }
}

colorCell = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
}

//Draw
function updateView() {
    drawBoardBg()
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (game.board[y][x].marked) {
                colorCell(x, y, markColor)
            }
            if (game.board[y][x].available) {
                colorCell(x, y, availableColor)
            }
        }
    }
    drawBoard(game)
}