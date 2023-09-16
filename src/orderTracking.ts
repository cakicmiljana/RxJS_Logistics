import { Observable, Subject, combineLatest, concatMap, endWith, filter, forkJoin, from, interval, map, scan, skipUntil, startWith, switchMap, takeUntil, takeWhile, tap } from "rxjs";
import { Order } from "./order";
import { Driver } from "./person";
import { Truck } from "./vehicle";
import { getDriver, getTruck, updateDriverRequest, updateOrderRequest, updateTruckRequest } from "./services";
import { garageLocation } from "../config";


export function trackOrder(orderForTracking: Order) {

    if(orderForTracking.AssignedTruckID && orderForTracking.AssignedDriverID) {

        const truck$=getTruck(orderForTracking.AssignedTruckID); 
        const driver$=getDriver(orderForTracking.AssignedDriverID);

        if(!truck$)
            throw new Error("Failed to load truck.")
        if(!driver$)
            throw new Error("Failed to load driver.");

        forkJoin([truck$, driver$]).pipe(
            switchMap(([truckData, driverData]) => {
                const truck=new Truck(truckData);
                const driver=new Driver(driverData);
                return from(trackTruckLocation(truck)).pipe(
                    map((location) => ({ truck, driver, location }))
                )
            })
        ).subscribe(({truck, driver, location}) => {
            console.log('Truck ID: ', truck.id);
            console.log('Driver ID: ', driver.id);
            truck.CurrentLocation=location;
            console.log(truck.id + " location: "  + truck.CurrentLocation);
            truck.destinationReachedUpdate();
            driver.destinationReachedUpdate();
            orderForTracking.destinationReachedUpdate();
            updateTruckRequest(truck);
            updateDriverRequest(driver);
            updateOrderRequest(orderForTracking);
        });

    }

}

export function trackTruckLocation(movingTruck: Truck) {
    
    let gasLevel$ = new Observable<number>();
    let location$ = new Observable();
    let speed$ = new Observable<number>();
    let destinationReachedSubject = new Subject<void>();

    
    gasLevel$ = (function updateGasLevel() {
        return interval(2000).pipe(
            takeUntil(location$),
            startWith(movingTruck.GasLevel),
            scan((newGasLevel: number) => newGasLevel-1, movingTruck.GasLevel),
            takeWhile((currentGasLevel: number) => currentGasLevel > 0),
            // skipWhile(gasLevel => gasLevel > 0),
            tap((currentGasLevel: number) => {
                movingTruck.GasLevel = currentGasLevel;
                console.log(movingTruck.id + " gas level: " + currentGasLevel);
            })
        );
    })();
        
    speed$ = (function updateSpeed() {
        
        return interval(4000).pipe(
            takeUntil(location$),
            skipUntil(gasLevel$),
            map((newSpeed) => {
                newSpeed = Math.floor(Math.random()*100);
                return newSpeed;
            }),
            tap(newSpeed => {
                movingTruck.CurrentSpeed = newSpeed;
                console.log(movingTruck.id + " speed: " + newSpeed);
            }),
            endWith(0)
        );
    })();
    
    return location$ = (function updateLocation() {
        const stepSize=1000;

        return combineLatest([speed$, gasLevel$, interval(1000)]).pipe(
            takeUntil(destinationReachedSubject),
            filter(([currentSpeed, gasLevel]) => gasLevel > 0),
            //takeWhile(([currentSpeed, gasLevel]) => gasLevel > 0),
            map(([currentSpeed, gasLevel]) => {
                //console.log(this.id + " INNER gas level: " + gasLevel);

                const speedInMetersPerSecond = (currentSpeed * 1000 ) / 3600; // Convert km/h to m/s
                const latIncrement = (speedInMetersPerSecond*(gasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(movingTruck.CurrentLocation, movingTruck.FinalDestination) || 1)) 
                * (movingTruck.FinalDestination.lat() - movingTruck.CurrentLocation.lat());
                const lngIncrement = (speedInMetersPerSecond*(gasLevel**2) / (google.maps.geometry.spherical.computeDistanceBetween(movingTruck.CurrentLocation, movingTruck.FinalDestination) || 1)) 
                * (movingTruck.FinalDestination.lng() - movingTruck.CurrentLocation.lng());
                    
                let currentLocation=movingTruck.CurrentLocation;
                
                const newLocation = new google.maps.LatLng(currentLocation.lat() + latIncrement, currentLocation.lng() + lngIncrement);
                currentLocation = newLocation;

                if(Math.abs(currentLocation.lat() - movingTruck.FinalDestination.lat()) < 0.01 &&
                    (Math.abs(currentLocation.lng()-movingTruck.FinalDestination.lng()) < 0.01))
                {
                    destinationReachedSubject.next();
                    console.log("final: " + currentLocation);
                    console.log(movingTruck.id + " destination reached.");
                    //movingTruck.CurrentSpeed=0;
                }

                return currentLocation;
            })
            );
    })();
}