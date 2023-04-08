const opponentCaptures = document.querySelector("#opponentCaptures") as HTMLCanvasElement
const yourCaptures = document.querySelector("#yourCaptures") as HTMLCanvasElement

const prevDef = (event : Event) : void => {event.preventDefault();}

opponentCaptures.oncontextmenu = prevDef;
yourCaptures.oncontextmenu = prevDef;

const Cwidth : number = yourCaptures.width;
const Cheight: number  = yourCaptures.height;
const Csize: number  = Cheight;

const ctxY = yourCaptures.getContext("2d") as CanvasRenderingContext2D
const ctxO = opponentCaptures.getContext("2d") as CanvasRenderingContext2D

const drawPiecePos = (color : Color, pieceType : PieceType, index : number, context : CanvasRenderingContext2D) : void => {
    context.drawImage(getImage(color, pieceType), index*Csize, 0, Csize, Csize)
}

const clearCanvas = (canvas : HTMLCanvasElement, context : CanvasRenderingContext2D) : void => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

const displayCaptures = (game : Game, color : Color, playerView : Color) : void => {
    const contextYour = playerView === color ? ctxY : ctxO
    const contextOpp = playerView === otherColor(color) ? ctxO : ctxY
    switch (color) {
        case Color.Black:
            for (let i = 0; i < game.blackCaptures.length; i++) {
                drawPiecePos(game.blackCaptures[i].color, game.blackCaptures[i].pieceType, i, contextYour)
            }
            break;
        case Color.White:
            for (let i = 0; i < game.whiteCaptures.length; i++) {
                drawPiecePos(game.whiteCaptures[i].color, game.whiteCaptures[i].pieceType, i, contextOpp)
            }
            break;
        default:
            throw new Error("unreachable")
    }
}

const updateCaptures = () : void => {
    clearCanvas(yourCaptures, ctxY)
    clearCanvas(opponentCaptures, ctxO)
    displayCaptures(game, playerview, playerview)
    displayCaptures(game, otherColor(playerview), playerview)
}