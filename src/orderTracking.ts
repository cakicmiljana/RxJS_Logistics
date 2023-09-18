import { Observable, Subject, combineLatest, concatMap, endWith, filter, finalize, forkJoin, from, interval, map, scan, skipUntil, skipWhile, startWith, switchMap, takeUntil, takeWhile, tap, zip } from "rxjs";
import { Order } from "./order";
import { Driver } from "./person";
import { Truck } from "./vehicle";
import { getDriver, getTruck, updateDriverRequest, updateOrderRequest, updateTruckRequest } from "./services";
import { garageLocation } from "../config";

let currentLocationMarker: google.maps.Marker;

export function orderTransitSimulation(orderForTracking: Order) {

    if(orderForTracking.AssignedTruckID && orderForTracking.AssignedDriverID) {

        const truck$=getTruck(orderForTracking.AssignedTruckID);
        const driver$=getDriver(orderForTracking.AssignedDriverID);

        if(!truck$)
            throw new Error("Failed to load truck.")
        if(!driver$)
            throw new Error("Failed to load driver.");
        
        let truck: Truck;
        let driver: Driver;

        forkJoin([truck$, driver$]).pipe(
            switchMap(([truckData, driverData]) => {
                truck=new Truck(truckData);
                driver=new Driver(driverData);
                return from(trackTruckLocation(truck)).pipe(
                    map((location) => ({ truck, driver, location }))
                )
            }),
            finalize(() => {
                console.log("trackTruckLocation completed.");
                truck.destinationReachedUpdate(); // Call destinationReachedUpdate for truck
                driver.destinationReachedUpdate(); // Call destinationReachedUpdate for driver
                orderForTracking.destinationReachedUpdate(); // Call destinationReachedUpdate for orderForTracking
                // updateTruckRequest(truck);
                // updateDriverRequest(driver);
                // updateOrderRequest(orderForTracking);
                // Rest of your code
            })
        ).subscribe(({truck, driver, location}) => {
            truck.CurrentLocation=location;
            //currentLocationMarker.setPosition(truck.CurrentLocation);
            console.log('Gas level: ', truck.GasLevel);
            console.log('Speed: ', truck.CurrentSpeed);
            console.log("Location: "  + truck.CurrentLocation);
            // updateTruckRequest(truck);
            // updateDriverRequest(driver);
            // updateOrderRequest(orderForTracking);
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
            takeUntil(destinationReachedSubject),
            startWith(movingTruck.GasLevel),
            scan((newGasLevel: number) => newGasLevel-1, movingTruck.GasLevel),
            //takeWhile((currentGasLevel: number) => currentGasLevel > 0),
            filter(gasLevel => gasLevel > 0),
            tap((currentGasLevel: number) => {
                movingTruck.GasLevel = currentGasLevel;
                //console.log("Gas level: " + currentGasLevel);
            })
        );
    })();
        
    speed$ = (function updateSpeed() {
        
        return interval(2000).pipe(
            takeUntil(destinationReachedSubject),
            skipUntil(gasLevel$),
            map((newSpeed) => {
                newSpeed = Math.floor(Math.random()*100);
                return newSpeed;
            }),
            tap(newSpeed => {
                movingTruck.CurrentSpeed = newSpeed;
                //console.log(movingTruck.id + " speed: " + newSpeed);
            }),
            endWith(0)
        );
    })();
    
    return location$ = (function updateLocation() {
        const stepSize=1000;

        return zip([speed$, gasLevel$]).pipe(
            takeUntil(destinationReachedSubject),
            filter(([currentSpeed, gasLevel]) => gasLevel > 0),
            skipUntil(gasLevel$),
            skipUntil(speed$),
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
                    // truck.destinationReachedUpdate();
                    // driver.destinationReachedUpdate();
                    // orderForTracking.destinationReachedUpdate();
                    //movingTruck.CurrentSpeed=0;
                }

                return currentLocation;
            })
            );
    })();
}


export function shipOrder(pendingOrder: Order, allTrucks: Truck[], allDrivers: Driver[]) {

    console.log("ORDER: ", pendingOrder);

    let assignedTruck: Truck = allTrucks.find(truck => truck.Status==='idle' && truck.Capacity>=pendingOrder.TotalLoad)
    let assignedDriver: Driver = allDrivers.find(driver => driver.Status==='available')


    assignedTruck.Status='inTransit';
    assignedTruck.Load=pendingOrder.TotalLoad;
    assignedTruck.FinalDestination=new google.maps.LatLng(pendingOrder.Destination);

    assignedDriver.Status='onRoad';
    assignedDriver.AssignedVehicleID=assignedTruck.id;

    pendingOrder.Status='shipped';
    pendingOrder.AssignedTruckID=assignedTruck.id;
    pendingOrder.AssignedDriverID=assignedDriver.id;

    console.log("ORDER IS: ", pendingOrder);
    console.log("TRUCK IS: ", assignedTruck);
    console.log("DRIVER IS: ", assignedDriver);

    updateTruckRequest(assignedTruck);
    updateDriverRequest(assignedDriver);
    updateOrderRequest(pendingOrder);
}

// export function trackOrder(truck: Truck) {

//     const myMap = new google.maps.Map(document.getElementById("map"), 
//         {
//             center: garageLocation,
//             zoom: 7
//         });
    
//     currentLocationMarker = new google.maps.Marker({
//         position: truck.CurrentLocation,
//         map: myMap
//     });

//     let FinalDestinationMarker = new google.maps.Marker({
//         position: truck.FinalDestination,
//         map: myMap
//     });
// }