import { Observable, debounceTime, forkJoin, fromEvent, map, merge, mergeAll, mergeMap, takeUntil, tap } from "rxjs";
import { garageLocation, vehiclesURL } from "../config";
import { Coordinates } from "../testFunctions/coordinates";
import { createTruckObservables, deleteContent } from "./services";
import { Person } from "./person";
import { Shipment } from "./shipment";
import { Truck, Vehicle, VehicleStatus } from "./vehicle";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";

// glavni container
const mainDiv = document.createElement("div");
mainDiv.classList.add("main-div");
mainDiv.id="main";
document.body.appendChild(mainDiv);

// meni
const menuDiv = document.createElement("div");
menuDiv.classList.add("menu-div");
mainDiv.appendChild(menuDiv);

const menuH=document.createElement("h2");
menuH.classList.add("menu-h");
menuH.textContent="MENU";
menuH.style.marginBottom="40px";
menuDiv.appendChild(menuH);

// podaci o kamionima
const trucksDiv=document.createElement("div");
trucksDiv.classList.add("trucks-div");
trucksDiv.textContent="TRUCKS";
menuDiv.appendChild(trucksDiv);

// podaci o vozacima
const driversDiv=document.createElement("div");
driversDiv.classList.add("drivers-div");
driversDiv.textContent="DRIVERS";
menuDiv.appendChild(driversDiv);

// podaci o turama
const bookingsDiv=document.createElement("div");
bookingsDiv.classList.add("bookings-div");
bookingsDiv.textContent="BOOKINGS";
menuDiv.appendChild(bookingsDiv);

// content
const contentDiv = document.createElement("div");
contentDiv.classList.add("content-div");
mainDiv.appendChild(contentDiv);

// mapa
// const mapDiv=document.createElement("div");
// mapDiv.classList.add("map-div");
// mapDiv.id="map";
// contentDiv.appendChild(mapDiv);

//const truckkk=new Truck("1",new Date("2025-05-14"),"1",1,1,1,1,"idle",new google.maps.LatLng( garageLocation),new google.maps.LatLng( garageLocation));

let gasLevel$;
let speed$;
let location$;

let allTruck$: Observable<Truck[]> = createTruckObservables();

allTruck$.subscribe(trucks=>{
    for(let t of trucks) {
        const truck=new Truck(t.id,t.RegistrationExpiryDate,t.Model,t.Capacity,t.Load,t.CurrentSpeed,
            t.GasLevel,t.Status, new google.maps.LatLng(t.CurrentLocation),
            new google.maps.LatLng(t.FinalDestination));
        
        truck.drawTruck(contentDiv);
        if(truck.Status=='inTransit') {
            truck.updateGasLevel();
            truck.updateSpeed();
            truck.updateLocation();
        }
    }
});



// .subscribe((trucks) => {
//     console.log(trucks);
//     trucks.forEach(truck => {
//         console.log(truck);
//         truck.drawTruck(contentDiv);
//     });
// });
    
// (async function initMap() {
//     const myMap = new google.maps.Map(mapDiv, 
//     {
//         center: garageLocation,
//         zoom: 7
//     });
// })();


// trucksDiv.onclick = async (event) => {
//     event.preventDefault();

//     deleteContent(event, 'trucks-div', contentDiv);
    
//     allTruck$.subscribe(trucks=>{
//         for(let t of trucks) {
//             const truck=new Truck(t.id,t.RegistrationExpiryDate,t.Model,t.Capacity,t.Load,t.CurrentSpeed,
//                 t.GasLevel,t.Status, new google.maps.LatLng(t.CurrentLocation),
//                 new google.maps.LatLng(t.FinalDestination));
            
//             truck.drawTruck(contentDiv);
//         }
//     });
// }

driversDiv.onclick = async (event) => {
    event.preventDefault();

    deleteContent(event, 'drivers-div', contentDiv);
}

bookingsDiv.onclick = async (event) => {
    event.preventDefault();

    deleteContent(event, 'bookings-div', contentDiv);
}