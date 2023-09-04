import { Observable, interval, map } from "rxjs";
import { Vehicle } from "../src/vehicle";

export const startingX=42.9976;
export const startingY=21.9654;

export class Coordinates {
    x: number;
    y: number;

    // constructor() {
    //     this.x=startingX;
    //     this.y=startingY;
    // }

    constructor(X?: number, Y?:number) {
        if(X)
            this.x=X;
        else this.x=startingX;
        if(Y)
            this.y=Y;
        else this.y=startingY;
    }

    simulateMovement() : Observable<Coordinates> {
        return interval(3000).pipe(
            map(() => {
                this.x += 0.1;
                this.y += 0.1;

                return new Coordinates(this.x, this.y);                
            })
        );
    }
}