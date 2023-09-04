import { Registration } from "./registration";
import { Coordinates } from "./coordinates";

export interface Vehicle {
    // LicencePlate: Registration,
    RegistrationID: string,
    LicenceExpityDate: Date,
    Model: string,
    Capacity: number,
    CurrentLocation: Coordinates,
    CurrentSpeed: number,
    GasLevel: number,
    Status: 'idle' | 'inTransit',
}

class Truck implements Vehicle {
    RegistrationID: string;
    LicenceExpityDate: Date;
    Model: string;
    Capacity: number;
    Load: number;
    CurrentLocation: Coordinates;
    CurrentSpeed: number;
    GasLevel: number;
    Status: "idle" | "inTransit";
}