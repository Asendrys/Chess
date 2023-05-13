class Promotion {
    visible : boolean;
    color : Color;
    file : number;
    queenY : number;
    rookY : number;
    bishopY : number;
    knightY : number;

    constructor(color:Color, file : number, top : number, direction : -1|1) {
        this.visible = true;
        this.color = color;
        this.file = file;
        this.queenY = top + 1 * direction;
        this.rookY = top + 2 * direction;
        this.bishopY = top + 3 * direction;
        this.knightY = top + 4 * direction;
    }
}