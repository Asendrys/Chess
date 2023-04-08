let playerview = Color.Black //temp

function switchView() {
    playerview = otherColor(playerview)
    update()
}

let game = new Game()

function init() {
    update()
}

function update() {
    updateView()
    updateCaptures()
}