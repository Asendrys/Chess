function getCell(playerColor : Color, mouseX : number, mouseY : number) : {x:number, y:number} {
    const rect = canvas.getBoundingClientRect();
    const xval = Math.floor((mouseX - rect.x) / squareSize);
    const yval = Math.floor((mouseY - rect.y) / squareSize);
    switch (playerColor) {
        case Color.White:
            return {
                x: xval, 
                y: yval,
            };
        case Color.Black:
            return {
                x: 7 - xval, 
                y: 7 - yval,
            };
        default:
            throw new Error("unreachable");
    }
}

function clickdown(event : MouseEvent) {
    update();
    event.preventDefault();
    if (event.button === 0) { //Only left click
        const cell_coords : {x:number, y:number} = getCell(playerview, event.clientX, event.clientY);
        game.select(game.board.at(cell_coords.y, cell_coords.x)!);
    }
}

canvas.addEventListener('mousedown', clickdown);

function computeAvailableCells(val: boolean, game: Game, cell_coords : {x:number, y:number}) : void {
    for (const cell of availableCells(game, cell_coords.x, cell_coords.y)) {
        if (inBoundaries(cell.x, cell.y) )
            game.board.at(cell.y, cell.x)!.available = val;
    }
}

function hover(event : MouseEvent) {
    update();
    //Remove available marked cells
    for (let row = 0; row < 8 ; row++) {
        for (let col = 0; col < 8; col++) {
            game.board.at(row, col)!.available = false;
        }
    }
    const cell_coords = getCell(playerview, event.clientX, event.clientY);
    // game.select(game.board.at(cell_coords.y, cell_coords.x)!)
    if (!game.selecting) //Draw the available green squares
        computeAvailableCells(true, game, cell_coords);

    if (event.button === 0 
        && game.selecting 
        && game.selectedCell !== null 
        && game.selectedCell.piece !== undefined) { // Selecting
        computeAvailableCells(true, game, game.selectedCell);
        const rect = canvas.getBoundingClientRect();
        drawPieceAt(game.selectedCell.piece, 
            Math.floor(event.clientY - rect.y - 0.5*squareSize), 
            Math.floor(event.clientX - rect.x - 0.5*squareSize)
        )
    }
}

canvas.addEventListener('mousemove', hover);

// canvas.addEventListener("mouseleave", (event) => {
//     canvas.removeEventListener("mousemove", hover)
// })

// canvas.addEventListener("mouseenter", (event) => {
//     canvas.addEventListener("mousemove", hover)
// })

// canvas.addEventListener('touchstart', (event : TouchEvent) => {
//     event.preventDefault();
//     const cell_coords : {x:number, y:number} = getCell(playerview, event.touches[0].clientX, event.touches[0].clientY )
//     game.select(game.board.at(cell_coords.y, cell_coords.x)!)
//     availableCells(game, cell_coords.x, cell_coords.y).forEach(cell => {
//         if (inBoundaries(cell.x, cell.y) )
//             game.board.at(cell.y, cell.x)!.available = true
//     })
//     update()
// })

canvas.addEventListener('mouseup', (event : MouseEvent) => {
    event.preventDefault();
    const cell_coords = getCell(playerview, event.clientX, event.clientY )
    if (
        event.button === 0 
        && game.selecting 
        && (
            game.selectedCell?.x !== cell_coords.x 
            || game.selectedCell?.y !== cell_coords.y
            ) ) { // If dragged to a different cell
        const cell = game.selectedCell as Cell;
        movePiece(game, cell.x, cell.y, cell_coords.x, cell_coords.y);
    } else if (event.button === 2) { //If marking cells
        game.board.at(cell_coords.y, cell_coords.x)!.marked = !(game.board.at(cell_coords.y, cell_coords.x)!.marked);
    }

    for (let row = 0; row < 8 ; row++) { 
        for (let col = 0; col < 8; col++) {
            game.board.at(row, col)!.available = false;
        }
    }

    game.unselect();
    update();
})

canvas.addEventListener('touchend', (event : TouchEvent) => {
    event.preventDefault();
    const cell_coords = getCell(playerview, event.touches[0].clientX, event.touches[0].clientY );
    if (game.selecting 
        && (game.selectedCell?.x !== cell_coords.x
            || game.selectedCell?.y !== cell_coords.y) ) {
        const cell = game.selectedCell as Cell;
        movePiece(game, cell.x, cell.y, cell_coords.x, cell_coords.y);
    }

    for (let row = 0; row < 8 ; row++) {
        for (let col = 0; col < 8; col++) {
            game.board.at(row, col)!.available = false;
        }
    }

    game.unselect();
    update();
})

async function choosePromotion(promotion : Promotion) : Promise<PieceType> {
    let result : PieceType|undefined = undefined;
    let promise : Promise<void> = new Promise((resolve) => {
        canvas.addEventListener('mousedown', (event : MouseEvent) => {
            event.preventDefault();
            if (event.button === 0) { //Only left click
                const cell_coords = getCell(playerview, event.clientX, event.clientY );
                if (promotion.file !== cell_coords.x
                    || ![promotion.queenY, promotion.rookY, promotion.bishopY, promotion.knightY].includes(cell_coords.y))
                    return;
                switch (cell_coords.y) {
                    case promotion.queenY:
                        result = PieceType.Queen;
                        resolve();
                        break
                    case promotion.rookY:
                        result = PieceType.Rook;
                        resolve();
                        break
                    case promotion.bishopY:
                        result = PieceType.Bishop;
                        resolve();
                        break
                    case promotion.knightY:
                        result = PieceType.Knight;
                        resolve();
                        break
                    default:
                        throw new Error("Unreachable");
                }
            }
        })
    })
    canvas.removeEventListener('mousedown', clickdown);
    await promise.then();
    canvas.addEventListener('mousedown', clickdown);
    return result! ;
}