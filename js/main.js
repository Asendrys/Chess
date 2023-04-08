"use strict";
let playerview = Color.White; //temp
function switchView() {
    playerview = otherColor(playerview);
    update();
}
const game = new Game();
function init() {
    update();
}
function update() {
    updateView();
    updateCaptures();
}
