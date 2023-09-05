import { garageLocation, vehiclesURL } from "../config";
import { Coordinates } from "../testFunctions/coordinates";
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

menuDiv.onclick = async () => {
    if(contentDiv.contains(mapDiv))
        contentDiv.removeChild(mapDiv);
}

trucksDiv.onclick = async () => {
    const trucksJSON = await fetch(vehiclesURL);
    const trucksData=await trucksJSON.json();
    for(let truckData of trucksData) {
        const truck=new Truck(truckData.id, truckData.RegistrationExpiryDate, truckData.Model, 
            truckData.Capacity, truckData.Load, truckData.CurrentSpeed, truckData.GasLevel, truckData.Status,
            new google.maps.LatLng(truckData.CurrentLocation.lat, truckData.CurrentLocation.lng));
            
            console.log(typeof truck.Status);
            truck.drawTruck(contentDiv);
    }
    //Truck.showAllTrucksOnMap(mapDiv);
    //Truck.prototype.trackTruck("LE003AA");
}
