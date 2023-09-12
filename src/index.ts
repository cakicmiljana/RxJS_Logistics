import { Observable, debounceTime, forkJoin, fromEvent, map, merge, mergeAll, mergeMap, takeUntil, tap } from "rxjs";
import { garageLocation, vehiclesURL } from "../config";
import { Coordinates } from "../testFunctions/coordinates";
import { getTrucksFromServer, deleteContent, updateTruckRequest, getOrdersFromServer, getDriversFromServer } from "./services";
import { Driver, Person } from "./person";
import { Order } from "./order";
import { Truck, Vehicle, VehicleStatus } from "./vehicle";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { contentDiv, drawDrivers, drawOrder, drawOrders, drawTruck, drawTrucks, driversDiv, initializePage, ordersDiv, trucksDiv } from "./DOMstructure";

initializePage();

let allTrucks: Array<Truck>=[];
let allOrders: Array<Order>=[];
let allDrivers: Array<Driver>=[];

const truck$: Observable<Truck[]> = getTrucksFromServer();
const order$: Observable<Order[]> = getOrdersFromServer();  
const driver$: Observable<Driver[]> = getDriversFromServer();

truck$.subscribe(truck => {
    allTrucks=truck;
});

driver$.subscribe(drivers => {
    allDrivers=drivers;
})

order$.subscribe(orders=>{
    allOrders=orders;
});

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