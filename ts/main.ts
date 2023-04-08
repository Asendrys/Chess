let playerview : Color = Color.White //temp

function switchView() : void {
    playerview = otherColor(playerview)
    update()
}

const game : Game = new Game()

function init() : void {
    update()
}

function update() : void {
    updateView()
    updateCaptures()
}