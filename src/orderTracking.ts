import { Observable, Subject, combineLatest, concat, concatMap, endWith, filter, finalize, forkJoin, from, iif, interval, map, merge, mergeMap, of, scan, skipUntil, skipWhile, startWith, switchMap, take, takeUntil, takeWhile, tap, zip } from "rxjs";
import { Order } from "./models/order";
import { Driver, DriverStatus } from "./models/person";
import { Truck } from "./models/vehicle";
import { getDriver, getTruck, updateDriverRequest, updateOrderRequest, updateTruckRequest } from "./services";

export function orderTransitSimulation(orderForTracking: Order, currentLocationMarker: google.maps.Marker) {

    if(orderForTracking.AssignedTruckID && orderForTracking.AssignedDriverID)
    {
        
        let truck: Truck;
        let driver: Driver;
        const truck$=getTruck(orderForTracking.AssignedTruckID);
        const driver$=getDriver(orderForTracking.AssignedDriverID);
        
        if(!truck$)
            throw new Error("Failed to load truck.")
        if(!driver$)
            throw new Error("Failed to load driver.");
        

        forkJoin([truck$, driver$]).pipe(
            tap(([truckData, driverData]) => {
                truck=new Truck(truckData);
                driver=new Driver(driverData);
            }),
            switchMap(() => 
                from(trackTruckLocation(truck)).pipe(
                    map((location) => ({ truck, driver, location })),
                    finalize(() => {
                        truck.destinationReachedUpdate();
                        driver.destinationReachedUpdate();
                        orderForTracking.destinationReachedUpdate();
                        updateTruckRequest(truck);
                        updateDriverRequest(driver);
                        updateOrderRequest(orderForTracking);
                    })
                )
            )
        ).subscribe(({truck, driver, location}) => {
            truck.CurrentLocation=location;
            console.log('TRUCK: ', truck.id);
            console.log('Gas level: ', truck.GasLevel);
            console.log('Speed: ', truck.CurrentSpeed);
            console.log("Location: "  + truck.CurrentLocation);
            currentLocationMarker.setPosition(location);
            currentLocationMarker.setTitle('TRUCK ' + truck.id + '\n' + 'Speed: ' + truck.CurrentSpeed.toString() + '\n' + 'Gas level: ' + truck.GasLevel
            )
        });

    }

}

export function trackTruckLocation(movingTruck: Truck) {
    
    let gasLevel$ = new Observable<number>();
    let location$ = new Observable();
    let speed$ = new Observable<number>();
    let destinationReachedSubject = new Subject<void>();
    let noGasSubject = new Subject<void>();
    
    
    gasLevel$ = (function updateGasLevel() {

        return interval(2000).pipe(
            takeUntil(destinationReachedSubject),
            scan((newGasLevel: number) => newGasLevel > 0 ? newGasLevel - 1 : 0, movingTruck.GasLevel),
            tap((currentGasLevel: number) => {
                movingTruck.GasLevel = currentGasLevel;
                if(currentGasLevel===0)
                    noGasSubject.next()
            })
        );
    })();
        
    speed$ = (function updateSpeed() {

        
        return interval(6000).pipe(
            takeUntil(destinationReachedSubject),
            takeUntil(noGasSubject),
            map((newSpeed) => {
                newSpeed = Math.floor(Math.random()*100);
                return newSpeed;
            }),
            endWith(0),
            tap(newSpeed => {
                movingTruck.CurrentSpeed = newSpeed;
            })
        );
    })();
    
    return location$ = (function updateLocation() {

        return combineLatest([speed$, gasLevel$]).pipe(
            takeUntil(destinationReachedSubject),
            map(([currentSpeed, gasLevel]) => {

                const speedInMetersPerSecond = (currentSpeed * 1000 ) / 3600;
                const latIncrement = ((speedInMetersPerSecond ** 2) / (google.maps.geometry.spherical.computeDistanceBetween(movingTruck.CurrentLocation, movingTruck.FinalDestination))) 
                * (movingTruck.FinalDestination.lat() - movingTruck.CurrentLocation.lat());
                const lngIncrement = ((speedInMetersPerSecond ** 2) / (google.maps.geometry.spherical.computeDistanceBetween(movingTruck.CurrentLocation, movingTruck.FinalDestination))) 
                * (movingTruck.FinalDestination.lng() - movingTruck.CurrentLocation.lng());
                    
                let currentLocation=movingTruck.CurrentLocation;
                
                const newLocation = new google.maps.LatLng(currentLocation.lat() + latIncrement, currentLocation.lng() + lngIncrement);
                currentLocation = newLocation;

                if(Math.abs(currentLocation.lat() - movingTruck.FinalDestination.lat()) < 0.01 &&
                    (Math.abs(currentLocation.lng()-movingTruck.FinalDestination.lng()) < 0.01))
                {
                    destinationReachedSubject.next();
                    console.log(movingTruck.id + " destination reached.");
                }

                return currentLocation;
            })
            );
    })();
}


export function shipOrder(pendingOrder: Order, allTrucks: Truck[], allDrivers: Driver[]) {

    let assignedTruck: Truck = allTrucks.find(truck => truck.Status==='idle' && truck.Capacity>=pendingOrder.TotalLoad)
    let assignedDriver: Driver = allDrivers.find(driver => driver.Status===DriverStatus.available)

    if(assignedTruck && assignedDriver)
    {
        assignedTruck.Status='inTransit';
        assignedTruck.Load=pendingOrder.TotalLoad;
        assignedTruck.FinalDestination=new google.maps.LatLng(pendingOrder.Destination);

        assignedDriver.Status=DriverStatus.onRoad;
        assignedDriver.AssignedVehicleID=assignedTruck.id;

        pendingOrder.Status='shipped';
        pendingOrder.AssignedTruckID=assignedTruck.id;
        pendingOrder.AssignedDriverID=assignedDriver.id;

        updateTruckRequest(assignedTruck);
        updateDriverRequest(assignedDriver);
        updateOrderRequest(pendingOrder);
    }
    else{
        console.error("No resources available!");
    }
}