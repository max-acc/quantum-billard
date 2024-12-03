const COLORS = ["FFF", "000", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0", "0F0"]


class Table {
    constructor(width, height, ballradius) {
        this.width = width;
        this.height = height;
        this.ballradius = ballradius;

        this.pockets = this._initializePockets();
        
        this.balls = [COLORS.size - 1];
        this.whiteBall;
    }

    createTable() {
        const newTable = document.createElement("div");


        document.body.insertBefore(newTable)
    }

    _initializePockets() {
        return [
            { x: 0, y: 0 }, // Top-left
            { x: this.width / 2, y: 0 }, // Top-center
            { x: this.width, y: 0 }, // Top-right
            { x: 0, y: this.height }, // Bottom-left
            { x: this.width / 2, y: this.height }, // Bottom-center
            { x: this.width, y: this.height } // Bottom-right
        ];
    }

    addBalls() {
        this.whiteBall = new Ball(this.ballradius, COLORS[0]);
        for (let i = 0; i < COLORS.size - 1; i++) {
            this.balls[i] = new Ball(ballradius, COLORS[i + 1])
        }
    }

    positionBalls() {

    }



}