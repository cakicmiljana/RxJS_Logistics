import { Coordinates } from "../testFunctions/coordinates";
import { garageLocation, vehiclesURL } from "../config";
import { Observable, Subject, Subscription, combineLatest, endWith, filter, interval, map, of, scan, skipUntil, skipWhile, startWith, take, takeUntil, takeWhile, tap } from "rxjs";
import { getTrucksFromServer, updateTruckRequest } from "./services";
import { Driver } from "./person";

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

    // private gasLevel$ = new Observable<number>();
    // private location$ = new Observable();
    // private speed$ = new Observable<number>();
    // private destinationReachedSubject = new Subject<void>();

    constructor(order: Truck) {
            this.id=order.id;
            this.RegistrationExpiryDate=order.RegistrationExpiryDate;
            this.Model=order.Model;
            this.Capacity=order.Capacity;
            this.Load=order.Load;
            this.CurrentSpeed=order.CurrentSpeed;
            this.GasLevel=order.GasLevel;
            this.Status=order.Status;
            this.CurrentLocation=new google.maps.LatLng(order.CurrentLocation);
            this.FinalDestination=new google.maps.LatLng(order.FinalDestination);
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

      destinationReachedUpdate() {
        this.Status='idle';
        this.Load=0;
        this.CurrentLocation=new google.maps.LatLng(garageLocation);
        this.FinalDestination= new google.maps.LatLng(garageLocation);
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

        // updateGasLevel() {
        //     this.gasLevel$=interval(2000);

        //     this.gasLevel$ = this.gasLevel$.pipe(
        //         takeUntil(this.destinationReachedSubject),
        //         startWith(this.GasLevel),
        //         scan((gasLevel) => gasLevel-1, this.GasLevel),
        //         takeWhile((gasLevel) => gasLevel >= 0),
        //         // skipWhile(gasLevel => gasLevel > 0),
        //         tap(gasLevel => {
        //             this.GasLevel = gasLevel;
        //             console.log(this.id + " gas level: " + gasLevel);
        //         })
        //     );
                
        //     // .subscribe(gasLevel => 
        //     //     console.log(this.id + " gas level: " + gasLevel))
        // }
        
        // updateSpeed() {
        //     this.speed$=interval(4000);

        //     this.speed$ = this.speed$.pipe(
        //         takeUntil(this.destinationReachedSubject),
        //         skipUntil(this.gasLevel$),
        //         map((currentSpeed) => {
        //             currentSpeed = Math.floor(Math.random()*100);
        //             return currentSpeed;
        //         }),
        //         tap( currentSpeed => {
        //             this.CurrentSpeed = currentSpeed;
        //             console.log(this.id + " speed: " + currentSpeed);
        //         }),
        //         endWith(0)
        //     );
        // }
        
        // updateLocation() {
        //     const stepSize=1000;

        //     this.location$ = combineLatest([this.speed$, this.gasLevel$, interval(1000)]).pipe(
        //         takeUntil(this.destinationReachedSubject),
        //         filter(([currentSpeed, gasLevel]) => gasLevel > 0),
        //         //takeWhile(([currentSpeed, gasLevel]) => gasLevel > 0),
        //         map(([currentSpeed, gasLevel]) => {
        //             //console.log(this.id + " INNER gas level: " + gasLevel);

        //             const metersPerSecond = (currentSpeed * 1000 ) / 3600; // Convert speed to meters per second
        //             const latIncrement = (metersPerSecond*(gasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(this.CurrentLocation, this.FinalDestination) || 1)) 
        //             * (this.FinalDestination.lat() - this.CurrentLocation.lat());
        //             const lngIncrement = (metersPerSecond*(gasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(this.CurrentLocation, this.FinalDestination) || 1)) 
        //             * (this.FinalDestination.lng() - this.CurrentLocation.lng());
                        
        //             let currentLocation=this.CurrentLocation;
                    
        //             const newLocation = new google.maps.LatLng(currentLocation.lat()+latIncrement, currentLocation.lng()+lngIncrement);
        //             currentLocation = newLocation;

        //             return currentLocation;
        //         })
        //     // );
        //     // this.location$.subscribe((location: google.maps.LatLng) => {
        //     //     this.CurrentLocation=location;
        //     //     console.log(this.id + " location: "  + this.CurrentLocation);
        //     //     if(Math.abs(location.lat()-this.FinalDestination.lat())<0.01 &&
        //     //     (Math.abs(location.lng()-this.FinalDestination.lng())<0.01))
        //     //     {
        //     //         console.log("final: " + location);
        //     //         this.destinationReachedSubject.next();
        //     //         console.log(this.id + " destination reached.");
        //     //         this.Status='idle';
        //     //         this.CurrentLocation=new google.maps.LatLng(garageLocation);
        //     //         this.FinalDestination= new google.maps.LatLng(garageLocation);
        //     //         this.CurrentSpeed=0;
        //     //         updateTruckRequest(this);
        //     //     }
        //     // }
        //     )
        // }
}