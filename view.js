
//Views

const canvas = document.querySelector("#board")

canvas.oncontextmenu = function (event) {
    event.preventDefault();
};

const width = canvas.width;
const height = canvas.height;

const squareSize = width / 8;

const ctx = canvas.getContext("2d")

const lightSquare = "#eec";
const darkSquare = "#364";

const markColor = "rgba(0, 96, 256, 0.5)";
const availableColor = "rgba(0, 256, 96, 0.5)";


const img_prefix = "./img/"

const images_url = [
    [
        img_prefix + "Chess_kdt45.svg",
        img_prefix + "Chess_qdt45.svg",
        img_prefix + "Chess_rdt45.svg",
        img_prefix + "Chess_bdt45.svg",
        img_prefix + "Chess_ndt45.svg",
        img_prefix + "Chess_pdt45.svg",
    ], [
        img_prefix + "Chess_klt45.svg",
        img_prefix + "Chess_qlt45.svg",
        img_prefix + "Chess_rlt45.svg",
        img_prefix + "Chess_blt45.svg",
        img_prefix + "Chess_nlt45.svg",
        img_prefix + "Chess_plt45.svg",
    ]
]

let images = []
for (let i = 0; i < images_url.length; i++) {
    let images_col = new Array(images_url[i].length)
    for (let j = 0; j < images_url[i].length ; j++) {
        const img = new Image()
        img.src = images_url[i][j]
        img.onload = () => {
            images_col[j]  = img
        }
    }
    images.push(images_col)
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

drawBoard = (board) => {
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = board[y][x]
            if (cell.piece.pieceType !== PieceType.None && cell.piece.color != Color.None)
                drawPieceGrid(cell.piece.color, cell.piece.pieceType, y, x)
        }
    }
}

colorCell = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
}

//Draw
function updateView() {
    drawBoardBg()
    drawBoard(Board)
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (Board[y][x].marked) {
                colorCell(x, y, markColor)
            }
            if (Board[y][x].available) {
                colorCell(x, y, availableColor)
            }
        }
    }
}