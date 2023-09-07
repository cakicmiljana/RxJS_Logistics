import { debounceTime, fromEvent, map, mergeAll, mergeMap, tap } from "rxjs";
import { garageLocation, vehiclesURL } from "../config";
import { Coordinates } from "../testFunctions/coordinates";
import { getTrucks } from "./APIcalls";
import { Person } from "./person";
import { Shipment } from "./shipment";
import { Truck, Vehicle, VehicleStatus } from "./vehicle";

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
trucksDiv.classList.add("menuitem-div");
trucksDiv.textContent="TRUCKS";
menuDiv.appendChild(trucksDiv);

// podaci o vozacima
const driversDiv=document.createElement("div");
driversDiv.classList.add("menuitem-div");
driversDiv.textContent="DRIVERS";
menuDiv.appendChild(driversDiv);

// podaci o turama
const bookingsDiv=document.createElement("div");
bookingsDiv.classList.add("menuitem-div");
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

(function initMap() {
    const map = new google.maps.Map(mapDiv, 
    {
        center: garageLocation,
        zoom: 15
    });
})();

menuDiv.addEventListener("click", function(event) {
    let trgt=<Element>event.target;
    if(trgt.classList.contains('menuitem-div'))
        while(contentDiv.firstChild)
            contentDiv.removeChild(contentDiv.lastChild);
});

const allTruck$=getTrucks();

trucksDiv.onclick = () => {
    event.preventDefault();
    allTruck$.subscribe(myTruck => {
            myTruck.drawTruck(contentDiv);
            myTruck.simulateMovement().subscribe(x=>console.log(x));

            fetch(`${vehiclesURL}/${myTruck.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(myTruck),
              }).then(newTruckData => {
                console.log("inside fetch");
                myTruck.updateData(myTruck);
            });
        })
}