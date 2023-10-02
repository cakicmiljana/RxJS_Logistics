import { Observable, from } from "rxjs";
import { driversURL, ordersURL, vehiclesURL } from "../config";
import { Truck } from "./models/vehicle";
import { Order } from "./models/order";
import { Driver } from "./models/person";

export function getTruck(registrationID: string) : Observable<Truck> {
    return from(fetch(vehiclesURL + registrationID)
        .then(vehicle => {
            if(!vehicle.ok)
                throw new Error("Vehicle not found.");
            else
                return (vehicle.json());   
        })
        .catch(error => console.error(error))
    )
}

export function getTrucksFromServer() : Observable<Truck[]> {
    
    const promise = fetch(vehiclesURL)
        .then(response => 
            {
                if(response.ok) {
                    return response.json();
                }
                else {
                    throw new Error("Vehicles fetch failed.");
                }
            })
            .catch(error => console.log(error))

    return from(promise);
    
}

export function updateTruckRequest(truck: Truck) {
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

export function newTruckRequest(truck: Truck) {
    fetch(vehiclesURL, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify(truck)
    }).then(response => response.json())
    .catch(err => console.error(err))
    .then(order => console.log(order))
}

export async function getOrder(orderID: string) {
    return from(fetch(ordersURL + orderID)
        .then(order => {
            if(!order.ok)
                throw new Error("Order not found.");
            else
                return order.json();
            })
            .catch(error => console.error(error)));
}

export function getOrdersFromServer() : Observable<Order[]> {
    
    const promise = fetch(ordersURL)
        .then(response => 
            {
                if(response.ok) {
                    return response.json();
                }
                else {
                    throw new Error("Orders fetch failed.");
                }
            })
            .catch(error => console.log(error))

    return from(promise);
    
}

export function updateOrderRequest(order: Order) {
    fetch(`${ordersURL}/${order.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    }).then(newOrderData => {
        order.updateOrderData(order);
    });
}

export function newOrderRequest(order: Order) {
    fetch(ordersURL, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
    }).then(response => response.json())
    .catch(err => console.error(err))
    .then(order => console.log(order))
}

export function getDriver(driverID: string) {
    return from(fetch(driversURL + driverID)
        .then(driver => {
            if(!driver.ok)
                throw new Error("Driver not found.");
            else
                return driver.json();        
        })
            .catch(error => console.error(error)));
}

export function getDriversFromServer() : Observable<Driver[]> {
    const promise = fetch(driversURL)
        .then(response => 
            {
                if(response.ok) {
                    return response.json();
                }
                else {
                    throw new Error("Drivers fetch failed.");
                }
            })
            .catch(error => console.log(error))

    return from(promise);
}

export function updateDriverRequest(driver: Driver) {
    fetch(`${driversURL}/${driver.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(driver),
    }).then(newDriverData => {
        driver.updateDriverData(driver);
    });
}

export function newDriverRequest(driver: Driver) {
    fetch(driversURL, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify(driver)
    }).then(response => response.json())
    .catch(err => console.error(err))
    .then(order => console.log(order))
}

export function deleteContent(event: Event, className: string, host: HTMLElement) {
    let trgt=<Element>event.target;
    while(host.firstChild){
        if(!host.classList.contains(className)) {
            host.removeChild(host.lastChild);
        }
    }
}