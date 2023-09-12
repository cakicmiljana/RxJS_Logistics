import { Coordinates } from "../testFunctions/coordinates";
import { garageLocation, vehiclesURL } from "../config";
import { Observable, Subject, Subscription, combineLatest, endWith, filter, interval, map, of, scan, skipUntil, skipWhile, startWith, take, takeUntil, takeWhile, tap } from "rxjs";
import { getTrucksFromServer, updateTruckRequest } from "./services";

export enum VehicleStatus {
    'idle'='idle',
    'inTransit'='inTransit'
}

export interface Vehicle {
    id: string,
    RegistrationExpiryDate: Date,
    Model: string,
    Capacity: number,
    //CurrentLocation: Coordinates,
    CurrentSpeed: number,
    GasLevel: number,
    Status: 'idle' | 'inTransit',
}

export class Truck implements Vehicle {
    id: string;
    RegistrationExpiryDate: Date;
    Model: string;
    Capacity: number;
    Load: number;
    CurrentSpeed: number;
    GasLevel: number;
    Status: 'idle' | 'inTransit';
    CurrentLocation: google.maps.LatLng;
    FinalDestination: google.maps.LatLng;

    private gasLevel$ = new Observable<number>();
    private location$ = new Observable();
    private speed$ = new Observable<number>();
    private destinationReachedSubject = new Subject<void>();

    constructor(registration: string, expiryDate: Date, model: string, capacity: number, load:number,
        currSpeed: number, gasLevel: number, status:'idle' | 'inTransit', currLocation: google.maps.LatLng, finalDestination: google.maps.LatLng) {
            this.id=registration;
            this.RegistrationExpiryDate=expiryDate;
            this.Model=model;
            this.Capacity=capacity;
            this.Load=load;
            this.CurrentSpeed=currSpeed;
            this.GasLevel=gasLevel;
            this.Status=status;
            this.CurrentLocation=currLocation;
            this.FinalDestination=finalDestination;
        }

        updateTruckData(newData: Partial<Truck>): void {
            if (newData.hasOwnProperty('CurrentLocation')) {
              this.CurrentLocation = newData.CurrentLocation;
            }
            if (newData.hasOwnProperty('CurrentSpeed')) {
              this.CurrentSpeed = newData.CurrentSpeed;
            }
            if (newData.hasOwnProperty('GasLevel')) {
              this.GasLevel = newData.GasLevel;
            }
            if (newData.hasOwnProperty('Status')) {
              this.Status = newData.Status;
            }
            if (newData.hasOwnProperty('FinalDestination')) {
              this.FinalDestination = newData.FinalDestination;
            }
        }
        
        // drawTruck(host: HTMLElement) {
            
        //     const truckDiv=document.createElement("div");
        //     truckDiv.classList.add("truck-div");
        //     host.appendChild(truckDiv);

        //     const truckName=document.createElement("label");
        //     truckName.classList.add("label");
        //     truckName.textContent=this.id;
        //     truckDiv.appendChild(truckName);
            
        //     const truckModel=document.createElement("label");
        //     truckModel.classList.add("label");
        //     truckModel.textContent=this.Model;
        //     truckDiv.appendChild(truckModel);

        //     const currentLocationLabel=document.createElement("label");
        //     currentLocationLabel.classList.add("label");
        //     currentLocationLabel.textContent= "CURRENT LOCATION: " + this.CurrentLocation.toString();
        //     truckDiv.appendChild(currentLocationLabel);
            
        //     const destinationLabel=document.createElement("label");
        //     destinationLabel.classList.add("label");
        //     destinationLabel.textContent= "DESTINATION: " + this.FinalDestination.toString();
        //     truckDiv.appendChild(destinationLabel);

        //     const speedLabel=document.createElement("label");
        //     speedLabel.classList.add("label");
        //     speedLabel.textContent= "CURRENT SPEED: " + this.CurrentSpeed.toString() + "km/s";
        //     truckDiv.appendChild(speedLabel);

        //     const gasLevelLabel=document.createElement("label");
        //     gasLevelLabel.classList.add("label");
        //     gasLevelLabel.textContent="GAS LEVEL: " + this.GasLevel.toString() + "%";
        //     truckDiv.appendChild(gasLevelLabel);

        //     if(this.Status=='inTransit') {
        //         const trackButton=document.createElement("input");
        //         trackButton.type="button";
        //         trackButton.value="TRACK LOCATION";
        //         truckDiv.appendChild(trackButton);
                
        //         trackButton.addEventListener('click', (event) => 
        //         {
        //             console.log("target ", event.target);
        //             while(host.childNodes.length>1){
        //                 if(host.firstChild!=event.target)
        //                     host.removeChild(host.firstChild);
        //                 else host.removeChild(host.lastChild);
        //             }

        //             this.trackTruckLocation(this.id, host);
        //         })
        //     }

        //     console.log("div: ", truckDiv);

        // }

        async trackTruckLocation(ID: string, host: HTMLElement) {

            const truckOnMap = new google.maps.Map(host, 
            {
                center: this.CurrentLocation,
                zoom: 4
            });    
            const marker=new google.maps.Marker({
                position: this.CurrentLocation,
                map: truckOnMap
            });

            //this.simulateMovement().subscribe(newLocation => marker.setPosition(newLocation));
        }
        
        // static async showAllTrucksOnMap(vehicle$: Observable<Truck>, mapElement: HTMLDivElement) {
        //     const myMap = new google.maps.Map(mapElement, 
        //     {
        //         center: garageLocation,
        //         zoom: 7
        //     });
        //     return vehicle$.pipe(
        //         map((truck) => {
        //             const marker = new google.maps.Marker({
        //                 position: truck.CurrentLocation,
        //                 map: myMap
        //             });
        //             return marker;
        //         })
        //     );
        // }

        updateGasLevel() {
            this.gasLevel$=interval(2000);

            this.gasLevel$ = this.gasLevel$.pipe(
                takeUntil(this.destinationReachedSubject),
                startWith(this.GasLevel),
                scan((gasLevel) => gasLevel-1, this.GasLevel),
                takeWhile((gasLevel) => gasLevel >= 0),
                // skipWhile(gasLevel => gasLevel > 0),
                tap(gasLevel => {
                    this.GasLevel = gasLevel;
                    console.log(this.id + " gas level: " + gasLevel);
                })
            );
                
            // .subscribe(gasLevel => 
            //     console.log(this.id + " gas level: " + gasLevel))
        }
        
        updateSpeed() {
            this.speed$=interval(4000);

            this.speed$ = this.speed$.pipe(
                takeUntil(this.destinationReachedSubject),
                skipUntil(this.gasLevel$),
                map((currentSpeed) => {
                    currentSpeed = Math.floor(Math.random()*100);
                    return currentSpeed;
                }),
                tap( currentSpeed => {
                    this.CurrentSpeed = currentSpeed;
                    console.log(this.id + " speed: " + currentSpeed);
                }),
                endWith(0)
            );
        }
        
        updateLocation() {
            const stepSize=1000;

            this.location$ = combineLatest([this.speed$, this.gasLevel$, interval(1000)]).pipe(
                takeUntil(this.destinationReachedSubject),
                filter(([currentSpeed, gasLevel]) => gasLevel > 0),
                //takeWhile(([currentSpeed, gasLevel]) => gasLevel > 0),
                map(([currentSpeed, gasLevel]) => {
                    //console.log(this.id + " INNER gas level: " + gasLevel);

                    const metersPerSecond = (currentSpeed * 1000 ) / 3600; // Convert speed to meters per second
                    const latIncrement = (metersPerSecond*(gasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(this.CurrentLocation, this.FinalDestination) || 1)) 
                    * (this.FinalDestination.lat() - this.CurrentLocation.lat());
                    const lngIncrement = (metersPerSecond*(gasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(this.CurrentLocation, this.FinalDestination) || 1)) 
                    * (this.FinalDestination.lng() - this.CurrentLocation.lng());
                        
                    let currentLocation=this.CurrentLocation;
                    
                    const newLocation = new google.maps.LatLng(currentLocation.lat()+latIncrement, currentLocation.lng()+lngIncrement);
                    currentLocation = newLocation;

                    return currentLocation;
                })
            );
            this.location$.subscribe((location: google.maps.LatLng) => {
                this.CurrentLocation=location;
                console.log(this.id + " location: "  + this.CurrentLocation);
                if(Math.abs(location.lat()-this.FinalDestination.lat())<0.01 &&
                (Math.abs(location.lng()-this.FinalDestination.lng())<0.01))
                {
                    console.log("final: " + location);
                    this.destinationReachedSubject.next();
                    console.log(this.id + " destination reached.");
                    this.Status='idle';
                    this.CurrentLocation=new google.maps.LatLng(garageLocation);
                    this.FinalDestination= new google.maps.LatLng(garageLocation);
                    this.CurrentSpeed=0;
                    updateTruckRequest(this);
                }
            })
        }
}