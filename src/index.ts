import { Coordinates } from "./coordinates";
import { Person } from "./person";
import { Shipment } from "./shipment";
import { Vehicle } from "./vehicle";

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

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), 
    {
        center: { lat: 42.99772082585406, lng: 21.96547622553924 },
        zoom: 15
    });
    
}

initMap();