import { Observable, from, mergeMap, tap } from "rxjs";
import { vehiclesURL } from "../config";
import { Truck } from "./vehicle";

export function getTruck(registrationID: string) {
    fetch(vehiclesURL + registrationID)
        .then(vehicle => {
            if(!vehicle.ok)
                throw new Error("Vehicle not found.");
            else
                console.log(vehicle.json())})
            .catch(error => console.error(error));
}

export function getTrucks(host: HTMLElement) : Observable<Truck> {
    return new Observable<Truck>((observer) => {
        fetch(vehiclesURL).then(async (response) => {
            if(!response.ok)
                throw new Error("Vehicles fetch failed.");
            else {
                const trucksJSON=await response.json();
                for(const truckData of trucksJSON) {
                    const truck: Truck= new Truck(truckData.id, truckData.RegistrationExpiryDate, truckData.Model, 
                        truckData.Capacity, truckData.Load, truckData.CurrentSpeed, truckData.GasLevel, truckData.Status,
                        new google.maps.LatLng(truckData.CurrentLocation.lat, truckData.CurrentLocation.lng));   
                        
                        observer.next(truck);
                    }
                observer.complete();
                }
            })
            .catch(error=>console.error(error));
    })
}