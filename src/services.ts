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

export function createTruckObservables() : Observable<Truck>[] {
    let allTrucks: Observable<Truck>[] = [];
    
    fetch(vehiclesURL).then(async (APIresponse) => {
        if(!APIresponse.ok)
            throw new Error("Vehicles fetch failed.");
        else {
            await APIresponse.json().then((trucksJSON) => 
            {
                for(const truckData of trucksJSON) {
                        
                        allTrucks.push(new Observable<Truck>((observer) => {
                            observer.next(new Truck(
                                truckData.id,
                                truckData.RegistrationExpiryDate,
                                truckData.Model,
                                truckData.Capacity,
                                truckData.Load,
                                truckData.CurrentSpeed,
                                truckData.GasLevel,
                                truckData.Status,
                                new google.maps.LatLng(
                                  truckData.CurrentLocation.lat,
                                  truckData.CurrentLocation.lng
                                )));

                            observer.complete();
                        }))
                    }
            });
        }
    })
    .catch(error=>console.error(error));
    
    return allTrucks;
}

export function deleteContent(event: Event, className: string, host: HTMLElement) {
    let trgt=<Element>event.target;
    while(host.firstChild){
        if(!host.classList.contains(className)) {
            console.log("item", host.lastChild, "deleted");
            host.removeChild(host.lastChild);
        }
    }
}