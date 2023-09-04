import { Registration } from "./registration";
import { Coordinates } from "./coordinates";
import { garageLocation, vehiclesURL } from "../config";

export enum VehicleStatus {
    'idle'='idle',
    'inTransit'='inTransit'
}

export interface Vehicle {
    // LicencePlate: Registration,
    RegistrationID: string,
    RegistrationExpiryDate: Date,
    Model: string,
    Capacity: number,
    //CurrentLocation: Coordinates,
    CurrentSpeed: number,
    GasLevel: number,
    Status: VehicleStatus,
}

export class Truck implements Vehicle {
    RegistrationID: string;
    RegistrationExpiryDate: Date;
    Model: string;
    Capacity: number;
    Load: number;
    CurrentSpeed: number;
    GasLevel: number;
    Status: VehicleStatus;
    CurrentLocation: google.maps.LatLng;

    constructor(registration: string, expiryDate: Date, model: string, capacity: number, load:number,
        currSpeed: number, gasLevel: number, status:VehicleStatus, currLocation: google.maps.LatLng) {
            this.RegistrationID=registration;
            this.RegistrationExpiryDate=expiryDate;
            this.Model=model;
            this.Capacity=capacity;
            this.Load=load;
            this.CurrentSpeed=currSpeed;
            this.GasLevel=gasLevel;
            this.Status=status;
            this.CurrentLocation=currLocation;
        }

        getTruck(registrationID: string) {
            fetch(vehiclesURL + registrationID)
                .then(vehicle => {
                    if(!vehicle.ok)
                        throw new Error("Vehicle not found.");
                    else
                        console.log(vehicle.json())})
                    .catch(error => console.error(error));
        }

        async showAllTrucksOnMap(mapElement: HTMLDivElement) {
            const vehiclesJSON=await fetch(vehiclesURL);
            const vehiclesData=await vehiclesJSON.json();
            const map = new google.maps.Map(mapElement, 
            {
                center: garageLocation,
                zoom: 7
            });
            for(let vehicle of vehiclesData) {
                const truck = new Truck(vehicle.id,vehicle.RegistrationExpiryDate,vehicle.Model, vehicle.Capacity,
                    vehicle.Load,vehicle.CurrentSpeed,vehicle.GasLevel,vehicle.Status, vehicle.CurrentLocation);
                console.log(truck);
                
                const mark=new google.maps.Marker({
                    position: truck.CurrentLocation,
                    map: map
                });
            }
        }
}