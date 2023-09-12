import { Observable, from, mergeMap, tap } from "rxjs";
import { ordersURL, vehiclesURL } from "../config";
import { Truck } from "./vehicle";
import { Order } from "./order";

export function getTruck(registrationID: string) {
    fetch(vehiclesURL + registrationID)
        .then(vehicle => {
            if(!vehicle.ok)
                throw new Error("Vehicle not found.");
            else
                console.log(vehicle.json())})
            .catch(error => console.error(error));
}

export function getTrucksFromServer() : Observable<Truck[]> {
    
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

export function sendTruckToServer(truck: Truck) {
    fetch(`${vehiclesURL}/${truck.id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(truck),
}).then(newTruckData => {
    truck.updateTruckData(truck);
    });
}

export function getOrder(orderID: string) {
    fetch(ordersURL + orderID)
        .then(order => {
            if(!order.ok)
                throw new Error("Order not found.");
            else
                console.log(order.json())})
            .catch(error => console.error(error));
}

export function getOrdersFromServer() : Observable<Order[]> {
    
    return new Observable<Order[]>((observer) => {
        fetch(ordersURL)
        .then((APIresponse) => {
            if(!APIresponse.ok)
                throw new Error("Orders fetch failed.");
            else {
                return APIresponse.json();
            }
        })
        .then((data: Order[]) => {
            observer.next(data as Order[]);
            observer.complete();
        })
        .catch(err => observer.error(err));
    })
    
}

export function sendOrderToServer(order: Order) {
    fetch(`${ordersURL}/${order.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    }).then(newTruckData => {
        order.updateOrderData(order);
    });
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