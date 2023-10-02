import { Observable, zip } from "rxjs";
import { getTrucksFromServer, deleteContent, getOrdersFromServer, getDriversFromServer } from "./services";
import { Driver } from "./models/person";
import { Order } from "./models/order";
import { Truck } from "./models/vehicle";
import { drawDrivers, drawOrders, drawTrucks, initializePage } from "./DOMstructure";
import { orderTransitSimulation } from "./orderTracking";
import { setupMap } from "./mapLogic";

const menuDiv = document.createElement("div");
const trucksDiv=document.createElement("div");
const driversDiv=document.createElement("div");
const ordersDiv=document.createElement("div");
const contentDiv = document.createElement("div");
const mapDiv=document.createElement("div");
mapDiv.id="map";
let marker;

initializePage(menuDiv, trucksDiv, driversDiv, ordersDiv, contentDiv, mapDiv);

let workingMap: google.maps.Map;
(async function initMap() {
    workingMap = setupMap(mapDiv);
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
        const workingOrder = new Order(order);
        if(order.Status==='shipped') {
            const currentLocationMarker = new google.maps.Marker({
                map: workingMap,
            });
            orderTransitSimulation(workingOrder, currentLocationMarker);
        }
    })


    trucksDiv.addEventListener('click', async event => {
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
    
        drawOrders(allOrders, contentDiv, allTrucks, allDrivers);
    })
})
