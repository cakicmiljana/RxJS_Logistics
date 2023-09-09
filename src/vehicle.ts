import { Coordinates } from "../testFunctions/coordinates";
import { garageLocation, vehiclesURL } from "../config";
import { Observable, Subject, Subscription, interval, map, of, scan, take, takeUntil, tap } from "rxjs";
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

    private gasLevelSubject = new Subject<number>();
    private locationSubject = new Subject<google.maps.LatLng>();
    private speedSubject = new Subject<number>();
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
            // Update individual properties as needed
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

        // simulateMovement(marker: google.maps.Marker) {
        //     interval(1000).pipe(
        //         map(() => {
        //             const latValue=this.CurrentLocation.lat()+0.1;
        //             const lngValue=this.CurrentLocation.lng()+0.1;
        //             this.CurrentLocation=new google.maps.LatLng(latValue, lngValue);
        //             //console.log(this.CurrentLocation.lat(), this.CurrentLocation.lng());

        //             marker.setPosition(this.CurrentLocation);
        //         }),
        //         tap(() => {
                    
        //         })
        //         ).subscribe();
        // }

        simulateSpeedChange() {
            return interval(1000).pipe(
                map((x) => {
                    this.CurrentSpeed=x;
                    console.log(x);
                })
            )
        }

        simulateGasLevelChange() {
            const ga$=of(this.GasLevel);
            console.log("gas is " + this.GasLevel);
            return ga$.pipe(
                
                scan((acc, val) => {
                    return acc-val;
                })
            ).subscribe(x => console.log(x));
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
            const gasLevelObservable=interval(3000);

            gasLevelObservable.pipe(
                takeUntil(this.destinationReachedSubject)
            )
            .subscribe(() => {
                this.GasLevel-=1;
            })
        }

        
        updateSpeed() {
            const SpeedObservable=interval(3000);

            SpeedObservable.pipe(
                takeUntil(this.destinationReachedSubject)
            )
            .subscribe(() => {
                this.CurrentSpeed= Math.floor(Math.random()*100);
            })
        }
}