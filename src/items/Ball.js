const GRAVITATION = 9.81;
const PI = 3.1415;

class Ball {
    constructor(ballradius, color) {
        this.ballradius = ballradius;
        this.color = color
        this.mass = 1;

        this.type;

    }

    setType() {
        switch (this.color) {
            case "FFF":
                this.type = "WHITE";
                break;
            case "000":
                this.type = "BLACK";
            default:
                this.type = "NONE";
        }
            
    }


    /*
    Calculate the mass of a ball
    */
    _calcMassFromRadius(ballradius) {
        volume = (4/3) * PI * Math.pow(ballradius, 2);
        return volume * GRAVITATION;
    }


}