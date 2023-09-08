import { Observable, debounceTime, fromEvent, map, merge, mergeAll, mergeMap, takeUntil, tap } from "rxjs";
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
const mapDiv=document.createElement("div");
mapDiv.classList.add("map-div");
mapDiv.id="map";
contentDiv.appendChild(mapDiv);


let allTruck$ = createTruckObservables();

(async function initMap() {
    const myMap = new google.maps.Map(mapDiv, 
    {
        center: garageLocation,
        zoom: 7
    });

    allTruck$.map(truck$ => truck$);

    // allTruck$.forEach((truck$) => {
    //     truck$.subscribe((truck) => {
    //         const marker = new google.maps.Marker({
    //             position: truck.CurrentLocation,
    //             map: myMap
    //         });
    //     })
    // })
})();


trucksDiv.onclick = async (event) => {
    event.preventDefault();

    deleteContent(event, 'trucks-div', contentDiv);
    
    merge(...allTruck$).subscribe((truck) => {
            console.log("clicked ", truck);
            truck.drawTruck(contentDiv);
    })

}

driversDiv.onclick = async (event) => {
    event.preventDefault();

    deleteContent(event, 'drivers-div', contentDiv);
}

bookingsDiv.onclick = async (event) => {
    event.preventDefault();

    deleteContent(event, 'bookings-div', contentDiv);
}


// fetch(`${vehiclesURL}/${myTruck.id}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(myTruck),
//   }).then(newTruckData => {
//     console.log("inside fetch");
//     myTruck.updateData(myTruck);
// });