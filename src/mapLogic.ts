import { garageLocation } from "../config";
import { Truck } from "./models/vehicle";

let currentLocationMarker: google.maps.Marker;

export function setupMap(mapDiv: HTMLElement) : google.maps.Map {
    const myMap = new google.maps.Map(mapDiv, 
        {
            center: garageLocation,
            zoom: 7
        });
    
    currentLocationMarker = new google.maps.Marker({
        position: garageLocation,
        map: myMap
    });

    currentLocationMarker.setTitle("GARAGE")

    return myMap;
}

export function trackOrder(truck: Truck) {

    const myMap = new google.maps.Map(document.getElementById("map"), 
        {
            center: garageLocation,
            zoom: 7
        });
    
    currentLocationMarker = new google.maps.Marker({
        position: truck.CurrentLocation,
        map: myMap
    });

    let FinalDestinationMarker = new google.maps.Marker({
        position: truck.FinalDestination,
        map: myMap
    });

    setInterval(() => {
        currentLocationMarker.setPosition(truck.CurrentLocation);
        console.log("CURR ", truck.CurrentLocation.lat());
    }, 1000);
}