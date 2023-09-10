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

export function createTruckObservables() : Observable<Truck[]> {
    
    return new Observable<Truck[]>((observer) => {
        fetch(vehiclesURL)
        .then((APIresponse) => {
            if(!APIresponse.ok)
                throw new Error("Vehicles fetch failed.");
            else {
                return APIresponse.json();
            }
        })
        .then((data: Truck[]) => {
            observer.next(data as Truck[]);
            observer.complete();
        })
        .catch(err => observer.error(err));
    })
    
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

export function saveTruck(truck: Truck) {
    fetch(`${vehiclesURL}/${truck.id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(truck),
    }).then(newTruckData => {
        console.log("inside fetch");
        truck.updateData(truck);
    });
}