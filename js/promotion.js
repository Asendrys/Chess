"use strict";
class Promotion {
    constructor(color, file, top, direction) {
        this.visible = true;
        this.color = color;
        this.file = file;
        this.queenY = top + 1 * direction;
        this.rookY = top + 2 * direction;
        this.bishopY = top + 3 * direction;
        this.knightY = top + 4 * direction;
    }
}
