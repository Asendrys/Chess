

const getCell = (playerColor : Color, mouseX : number, mouseY : number) : {x:number, y:number} => {
    const rect = canvas.getBoundingClientRect();
    const xval = Math.floor((mouseX - rect.x) / squareSize)
    const yval = Math.floor((mouseY - rect.y) / squareSize)
    switch (playerColor) {
        case Color.White:
            return {
                x: xval, 
                y: yval,
            }
        case Color.Black:
            return {
                x: 7 - xval, 
                y: 7 - yval,
            }
        default:
            throw new Error("unreachable")
    }
}

const clickdown = (event : MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) { //Only left click
        const cell_coords : {x:number, y:number} = getCell(playerview, event.clientX, event.clientY )
        game.select(game.board.at(cell_coords.y, cell_coords.x)!)
        availableCells(game, cell_coords.x, cell_coords.y).forEach(cell => {
            if (inBoundaries(cell.x, cell.y) )
                game.board.at(cell.y, cell.x)!.available = true
        })
    }
    update()
}

canvas.addEventListener('mousedown', clickdown)

canvas.addEventListener('touchstart', (event : TouchEvent) => {
    event.preventDefault();
    const cell_coords : {x:number, y:number} = getCell(playerview, event.touches[0].clientX, event.touches[0].clientY )
    game.select(game.board.at(cell_coords.y, cell_coords.x)!)
    availableCells(game, cell_coords.x, cell_coords.y).forEach(cell => {
        if (inBoundaries(cell.x, cell.y) )
            game.board.at(cell.y, cell.x)!.available = true
    })
    update()
})

canvas.addEventListener('mouseup', (event : MouseEvent) => {
    event.preventDefault();
    const cell_coords = getCell(playerview, event.clientX, event.clientY )
    if (event.button === 0 && game.selecting && (game.selectedCell?.x !== cell_coords.x || game.selectedCell?.y !== cell_coords.y) ) {
        const cell = game.selectedCell as Cell;
        movePiece(game, cell.x, cell.y, cell_coords.x, cell_coords.y)
    } else if (event.button === 2) {
        game.board.at(cell_coords.y, cell_coords.x)!.marked = !(game.board.at(cell_coords.y, cell_coords.x)!.marked)
    }

    for (let row = 0; row < 8 ; row++) {
        for (let col = 0; col < 8; col++) {
            game.board.at(row, col)!.available = false
        }
    }

    game.unselect()
    update()
})

canvas.addEventListener('touchend', (event : TouchEvent) => {
    event.preventDefault();
    const cell_coords = getCell(playerview, event.touches[0].clientX, event.touches[0].clientY )
    if (game.selecting && (game.selectedCell?.x !== cell_coords.x || game.selectedCell?.y !== cell_coords.y) ) {
        const cell = game.selectedCell as Cell;
        movePiece(game, cell.x, cell.y, cell_coords.x, cell_coords.y)
    }

    for (let row = 0; row < 8 ; row++) {
        for (let col = 0; col < 8; col++) {
            game.board.at(row, col)!.available = false
        }
    }

    game.unselect()
    update()
})

async function choosePromotion(promotion : Promotion) : Promise<PieceType> {
    let result : PieceType|undefined = undefined
    let promise : Promise<void> = new Promise((resolve) => {
        canvas.addEventListener('mousedown', (event : MouseEvent) => {
            event.preventDefault();
            if (event.button === 0) { //Only left click
                const cell_coords : {x:number, y:number} = getCell(playerview, event.clientX, event.clientY )
                if (promotion.file !== cell_coords.x
                    || ![promotion.queenY, promotion.rookY, promotion.bishopY, promotion.knightY].includes(cell_coords.y))
                    return
                switch (cell_coords.y) {
                    case promotion.queenY:
                        result = PieceType.Queen
                        resolve()
                        break
                    case promotion.rookY:
                        result = PieceType.Rook
                        resolve()
                        break
                    case promotion.bishopY:
                        result = PieceType.Bishop
                        resolve()
                        break
                    case promotion.knightY:
                        result = PieceType.Knight
                        resolve()
                        break
                    default:
                        throw new Error("Unreachable")
                }
            }
        })
    })
    canvas.removeEventListener('mousedown', clickdown)
    await promise.then()
    canvas.addEventListener('mousedown', clickdown)
    return result!
}