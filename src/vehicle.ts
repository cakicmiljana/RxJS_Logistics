import { Coordinates } from "../testFunctions/coordinates";
import { garageLocation, vehiclesURL } from "../config";
import { Observable, Subject, Subscription, combineLatest, filter, interval, map, of, scan, skipWhile, startWith, take, takeUntil, takeWhile, tap } from "rxjs";
import { createTruckObservables } from "./services";

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

        updateData(newData: Partial<Truck>): void {
            if (newData.hasOwnProperty('CurrentLocation')) {
              this.CurrentLocation = newData.CurrentLocation;
            }
            if (newData.hasOwnProperty('CurrentSpeed')) {
              this.CurrentSpeed = newData.CurrentSpeed;
            }
            if (newData.hasOwnProperty('GasLevel')) {
              this.GasLevel = newData.GasLevel;
            }
            // Update other properties in a similar manner
          }
        
        drawTruck(host: HTMLElement) {
            
            const truckDiv=document.createElement("div");
            truckDiv.classList.add("truck-div");
            host.appendChild(truckDiv);

            const truckName=document.createElement("label");
            truckName.classList.add("label");
            truckName.textContent=this.id;
            truckDiv.appendChild(truckName);
            
            const truckModel=document.createElement("label");
            truckModel.classList.add("label");
            truckModel.textContent=this.Model;
            truckDiv.appendChild(truckModel);

            const currentLocationLabel=document.createElement("label");
            currentLocationLabel.classList.add("label");
            currentLocationLabel.textContent= "CURRENT LOCATION: " + this.CurrentLocation.toString();
            truckDiv.appendChild(currentLocationLabel);
            
            const destinationLabel=document.createElement("label");
            destinationLabel.classList.add("label");
            destinationLabel.textContent= "DESTINATION: " + this.FinalDestination.toString();
            truckDiv.appendChild(destinationLabel);

            const speedLabel=document.createElement("label");
            speedLabel.classList.add("label");
            speedLabel.textContent= "CURRENT SPEED: " + this.CurrentSpeed.toString() + "km/s";
            truckDiv.appendChild(speedLabel);

            const gasLevelLabel=document.createElement("label");
            gasLevelLabel.classList.add("label");
            gasLevelLabel.textContent="GAS LEVEL: " + this.GasLevel.toString() + "%";
            truckDiv.appendChild(gasLevelLabel);

            if(this.Status=='inTransit') {
                const trackButton=document.createElement("input");
                trackButton.type="button";
                trackButton.value="TRACK LOCATION";
                truckDiv.appendChild(trackButton);
                
                truckDiv.addEventListener('click', (event) => 
                {
                    console.log("target ", event.target);
                    while(host.childNodes.length>1){
                        if(host.firstChild!=event.target)
                            host.removeChild(host.firstChild);
                        else host.removeChild(host.lastChild);
                    }

                    this.trackTruckLocation(this.id, host);
                })
            }

            console.log("div: ", truckDiv);

        }

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

            this.simulateMovement().subscribe(newLocation => marker.setPosition(newLocation));
        }

        simulateMovement()  {
            return interval(1000).pipe(
                map(() => {
                    console.log(this);
                    const latValue=this.CurrentLocation.lat()+0.1;
                    const lngValue=this.CurrentLocation.lng()+0.1;
                    this.CurrentLocation=new google.maps.LatLng(latValue, lngValue);

                    return this.CurrentLocation;
                }),
                tap(() => {
                    
                }));
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

            this.gasLevel$.pipe(
                takeUntil(this.destinationReachedSubject),
                startWith(this.GasLevel),
                scan((gasLevel) => gasLevel-1),
                takeWhile((gasLevel) => gasLevel >= 0),
                // skipWhile(gasLevel => gasLevel > 0),
                tap((gasLevel) => {
                    this.GasLevel = gasLevel;
                    console.log(this.id + " gas level: " + gasLevel);
                    //return this.GasLevel;
                })
            )
            .subscribe()
        }
        
        updateSpeed() {
            this.speed$=interval(4000);

            this.speed$.pipe(
                takeUntil(this.destinationReachedSubject),
                map(() => {
                    this.CurrentSpeed = Math.floor(Math.random()*100);
                    console.log(this.id + " speed: " + this.CurrentSpeed);
                    return this.CurrentSpeed;
                })
            )
            .subscribe()
        }
        
        updateLocation() {
            const stepSize=1000;

            this.location$ = combineLatest([this.speed$, this.gasLevel$, interval(1000)]).pipe(
                takeUntil(this.destinationReachedSubject),
                filter(([currentSpeed, gasLevel]) => gasLevel > 0),
                takeWhile(([currentSpeed, gasLevel]) => gasLevel > 0),
                map(([currentSpeed, gasLevel]) => {
                    console.log(this.id + " INNER gas level: " + this.GasLevel);

                    const metersPerSecond = (currentSpeed * 1000 ) / 3600; // Convert speed to meters per second
                    const latIncrement = (metersPerSecond*(this.GasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(this.CurrentLocation, this.FinalDestination) || 1)) * (this.FinalDestination.lat() - this.CurrentLocation.lat());
                    const lngIncrement = (metersPerSecond*(this.GasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(this.CurrentLocation, this.FinalDestination) || 1)) * (this.FinalDestination.lng() - this.CurrentLocation.lng());
                    
                    const totalSteps=Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(
                        this.CurrentLocation,
                        this.FinalDestination) / stepSize);
                        
                    let currentLocation=this.CurrentLocation;
                    
                    const newLocation = new google.maps.LatLng(currentLocation.lat()+latIncrement, currentLocation.lng()+lngIncrement);
                    currentLocation = newLocation;
                    
                    return currentLocation;
                })
            );
            this.location$.subscribe((location: google.maps.LatLng) => {
                this.CurrentLocation=location;
                console.log(this.id + " location: "  + this.CurrentLocation);
                if(Math.abs(this.CurrentLocation.lat()-this.FinalDestination.lat())<0.01 &&
                (Math.abs(this.CurrentLocation.lng()-this.FinalDestination.lng())<0.01))
                {
                    console.log("final: " + this.CurrentLocation);
                    this.destinationReachedSubject.next();
                    console.log(this.id + " destination reached");
                }
            })
        }
}