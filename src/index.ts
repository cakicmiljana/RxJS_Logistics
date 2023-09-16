import { Observable, Subject, debounceTime, forkJoin, from, fromEvent, map, merge, mergeAll, mergeMap, of, takeUntil, tap, zip } from "rxjs";
import { garageLocation, vehiclesURL } from "../config";
import { Coordinates } from "../testFunctions/coordinates";
import { getTrucksFromServer, deleteContent, updateTruckRequest, getOrdersFromServer, getDriversFromServer, updateDriverRequest, updateOrderRequest, getTruck, getDriver } from "./services";
import { Driver, Person } from "./person";
import { Order } from "./order";
import { Truck, Vehicle, VehicleStatus } from "./vehicle";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { drawDrivers, drawOrders, drawTrucks, initializePage } from "./DOMstructure";
import { trackOrder } from "./orderTracking";

const menuDiv = document.createElement("div");
const trucksDiv=document.createElement("div");
const driversDiv=document.createElement("div");
const ordersDiv=document.createElement("div");
const contentDiv = document.createElement("div");
const mapDiv=document.createElement("div");
let marker;

initializePage(menuDiv, trucksDiv, driversDiv, ordersDiv, contentDiv, mapDiv);

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


let allTrucks: Array<Truck>=[];
let allOrders: Array<Order>=[];
let allDrivers: Array<Driver>=[];

const truck$: Observable<Truck[]> = getTrucksFromServer();
const order$: Observable<Order[]> = getOrdersFromServer();
const driver$: Observable<Driver[]> = getDriversFromServer();

zip([truck$, order$, driver$]).subscribe(([trucks, orders, drivers]) => {
    allTrucks=trucks;
    allOrders=orders;
    allDrivers=drivers;
    
    allOrders.forEach(order => {
        if(order.Status==='shipped') {
            
            
            //trackOrder(order);
        }
    })
})

let shippedOrder$;

const gasLevel$ = new Observable<number>();
const location$ = new Observable();
const speed$ = new Observable<number>();
const destinationReachedSubject = new Subject<void>();



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