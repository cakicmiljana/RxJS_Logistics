import { Coordinates } from "../testFunctions/coordinates";
import { garageLocation, vehiclesURL } from "../config";
import { interval, map } from "rxjs";

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
    Status: 'idle' | 'inTransit',
}

export class Truck implements Vehicle {
    RegistrationID: string;
    RegistrationExpiryDate: Date;
    Model: string;
    Capacity: number;
    Load: number;
    CurrentSpeed: number;
    GasLevel: number;
    Status: 'idle' | 'inTransit';
    CurrentLocation: google.maps.LatLng;

    constructor(registration: string, expiryDate: Date, model: string, capacity: number, load:number,
        currSpeed: number, gasLevel: number, status:'idle' | 'inTransit', currLocation: google.maps.LatLng) {
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

        static async showAllTrucksOnMap(mapElement: HTMLDivElement) {
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

        drawTruck(host: HTMLDivElement) {

            const truckDiv=document.createElement("div");
            truckDiv.classList.add("truck-div");
            host.appendChild(truckDiv);

            const truckName=document.createElement("label");
            truckName.classList.add("label");
            truckName.textContent=this.RegistrationID;
            truckDiv.appendChild(truckName);
            
            const truckModel=document.createElement("label");
            truckModel.classList.add("label");
            truckModel.textContent=this.Model;
            truckDiv.appendChild(truckModel);

            const locationLabel=document.createElement("label");
            locationLabel.classList.add("label");
            locationLabel.textContent=this.CurrentLocation.toString();
            truckDiv.appendChild(locationLabel);

            const speedLabel=document.createElement("label");
            speedLabel.classList.add("label");
            speedLabel.textContent= "CURRENT SPEED: " + this.CurrentSpeed.toString() + "km/s";
            truckDiv.appendChild(speedLabel);

            const gasLevelLabel=document.createElement("label");
            gasLevelLabel.classList.add("label");
            gasLevelLabel.textContent="GAS LEVEL: " + this.GasLevel.toString() + "%";
            truckDiv.appendChild(gasLevelLabel);

            console.log(this);
            if(this.Status=='inTransit') {
                const trackButton=document.createElement("input");
                trackButton.type="button";
                trackButton.value="TRACK LOCATION";
                truckDiv.appendChild(trackButton);
                
                trackButton.onclick = async () => {
                    this.trackTruckLocation(this.RegistrationID);
                }
            }

        }

        async trackTruckLocation(ID: string) {
            const truckJSON = await fetch(vehiclesURL + ID);
            const truckData=await truckJSON.json();

            const truck=new Truck(truckData.id, truckData.RegistrationExpiryDate, truckData.Model, 
                truckData.Capacity, truckData.Load, truckData.CurrentSpeed, truckData.GasLevel, truckData.Status,
                new google.maps.LatLng(truckData.CurrentLocation.lat, truckData.CurrentLocation.lng));

            const truckOnMap = new google.maps.Map(document.getElementById("map"), 
            {
                center: truck.CurrentLocation,
                zoom: 4
            });    
            const marker=new google.maps.Marker({
                position: truck.CurrentLocation,
                map: truckOnMap
            });

            interval(1000).pipe(
                map(() => {
                    const latValue=truck.CurrentLocation.lat()+0.1;
                    const lngValue=truck.CurrentLocation.lng()+0.1;
                    truck.CurrentLocation=new google.maps.LatLng(latValue, lngValue);
                    console.log(truck.CurrentLocation.lat(), truck.CurrentLocation.lng());

                    marker.setPosition(truck.CurrentLocation);
                })
            ).subscribe();
        }

        simulateMovement() {

        }
}