getCell = (mouseX, mouseY) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((mouseX - rect.x) / squareSize), 
        y: Math.floor((mouseY - rect.y) / squareSize),
    }
}

let selecting = false
let selectedCell = null

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { //Only left click
        let cell_coords = getCell(event.clientX, event.clientY )
        Board[cell_coords.y][cell_coords.x].selected = true
        selecting = true
        selectedCell = Board[cell_coords.y][cell_coords.x]

        availableCells(Board, cell_coords.x, cell_coords.y).forEach(cell => {
            if (inBoundaries(cell.x, cell.y) )
            Board[cell.y][cell.x].available = true
        })
    }
    updateView()
})

canvas.addEventListener('mouseup', (event) => {
    let cell_coords = getCell(event.clientX, event.clientY )
    if (selecting && (selectedCell.x !== cell_coords.x || selectedCell.y !== cell_coords.y) ) {
        movePiece(Board, selectedCell.x, selectedCell.y, cell_coords.x, cell_coords.y)
        selecting = false
        selectedCell.selected = false
        selectedCell = null
    } else if (event.button === 2) {
        Board[cell_coords.y][cell_coords.x].marked = !(Board[cell_coords.y][cell_coords.x].marked)
    }


    for (let row = 0; row < 8 ; row++) {
        for (let col = 0; col < 8; col++) {
            Board[row][col].available = false
        }
    }

    updateView()
})
