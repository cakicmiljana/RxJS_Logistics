import { Observable, debounceTime, forkJoin, fromEvent, map, merge, mergeAll, mergeMap, takeUntil, tap } from "rxjs";
import { garageLocation, vehiclesURL } from "../config";
import { Coordinates } from "../testFunctions/coordinates";
import { getTrucksFromServer, deleteContent, updateTruckRequest, getOrdersFromServer, getDriversFromServer, updateDriverRequest, updateOrderRequest } from "./services";
import { Driver, Person } from "./person";
import { Order } from "./order";
import { Truck, Vehicle, VehicleStatus } from "./vehicle";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { contentDiv, drawDrivers, drawOrder, drawOrders, drawTruck, drawTrucks, driversDiv, initializePage, mapDiv, ordersDiv, trucksDiv } from "./DOMstructure";

initializePage();
let marker;

(async function initMap() {
    const myMap = new google.maps.Map(mapDiv, 
    {
        center: garageLocation,
        zoom: 7
    });

    marker = new google.maps.Marker({
        position: garageLocation,
        map: myMap
    });
})();

export let allTrucks: Array<Truck>=[];
export let allOrders: Array<Order>=[];
export let allDrivers: Array<Driver>=[];

const truck$: Observable<Truck[]> = getTrucksFromServer();
const order$: Observable<Order[]> = getOrdersFromServer();
const driver$: Observable<Driver[]> = getDriversFromServer();

truck$.subscribe(truck => {
    allTrucks=truck;
}, err => {},
() => console.log("truck$ COMPLETED"));

driver$.subscribe(drivers => {
    allDrivers=drivers;
}, err => {},
() => console.log("driver$ COMPLETED"));

order$.pipe()
    .subscribe(orders=>{
    allOrders=orders;

        orders.forEach(async order => {
            if(order.Status=='pending') {
                let assignedTruck = allTrucks.find(truck => truck.Status == 'idle' && truck.Capacity >= order.TotalLoad);
                let assignedDriver = allDrivers.find(driver => driver.Status=='available');
    
                console.log("assigned truck: ", assignedTruck);
                console.log("assigned driver: ", assignedDriver);

                let newOrder= new Order(order.id, order.Status, order.TotalLoad, new google.maps.LatLng(order.Destination),
                    "", "");
                    if(assignedDriver && assignedTruck)
                newOrder.shipOrder(assignedTruck, assignedDriver);

                // if(assignedTruck && assignedDriver)
                //     order.shipOrder(assignedTruck, assignedDriver);
            }
        })

}, err => {},
() => console.log("order$ COMPLETED"));

trucksDiv.addEventListener('click', event => {
    event.preventDefault();
    deleteContent(event, 'trucks-div', contentDiv);
    
    drawTrucks(allTrucks, contentDiv);
})
    

driversDiv.addEventListener('click', event => {
    event.preventDefault();
    deleteContent(event, 'drivers-div', contentDiv);

    drawDrivers(allDrivers, contentDiv);
})

ordersDiv.addEventListener("click", async (event) => {
    event.preventDefault();
    deleteContent(event, 'orders-div', contentDiv);

    drawOrders(allOrders, contentDiv);
})