import { garageLocation } from "../config";
import { trackOrder } from "./mapLogic";
import { Order } from "./order";
import { shipOrder } from "./orderTracking";
import { Driver } from "./person";
import { getTruck, newOrderRequest, updateDriverRequest, updateOrderRequest, updateTruckRequest } from "./services";
import { Truck } from "./vehicle";

export function initializePage(menuDiv: HTMLDivElement, trucksDiv: HTMLDivElement, driversDiv: HTMLDivElement, ordersDiv: HTMLDivElement,
    contentDiv: HTMLDivElement, mapDiv: HTMLDivElement) {
    // glavni container
    const mainDiv = document.createElement("div");
    mainDiv.classList.add("main-div");
    mainDiv.id="main";
    document.body.appendChild(mainDiv);
    
    // meni
    menuDiv.classList.add("menu-div");
    mainDiv.appendChild(menuDiv);
    
    const menuH=document.createElement("h2");
    menuH.classList.add("menu-h");
    menuH.textContent="MENU";
    menuH.style.marginBottom="40px";
    menuDiv.appendChild(menuH);
    
    // podaci o kamionima
    trucksDiv.classList.add("trucks-div");
    trucksDiv.textContent="TRUCKS";
    menuDiv.appendChild(trucksDiv);

    // podaci o vozacima
    driversDiv.classList.add("drivers-div");
    driversDiv.textContent="DRIVERS";
    menuDiv.appendChild(driversDiv);

    // podaci o turama
    ordersDiv.classList.add("orders-div");
    ordersDiv.textContent="ORDERS";
    menuDiv.appendChild(ordersDiv);

    // content
    contentDiv.classList.add("content-div");
    mainDiv.appendChild(contentDiv);

    const welcomeLabel = document.createElement("h1");
    welcomeLabel.textContent="Welcome to order tracking. Please select entity.";
    contentDiv.appendChild(welcomeLabel);
    
    mapDiv.classList.add("map-div");
    mapDiv.id="map";
    mainDiv.appendChild(mapDiv);
}

export function drawTruck(truck: Truck, host: HTMLElement) {
            
    const truckDiv=document.createElement("div");
    truckDiv.classList.add("truck-div");
    host.appendChild(truckDiv);

    const truckName=document.createElement("label");
    truckName.classList.add("label");
    truckName.textContent=truck.id;
    truckDiv.appendChild(truckName);
    
    const truckModel=document.createElement("label");
    truckModel.classList.add("label");
    truckModel.textContent=truck.Model;
    truckDiv.appendChild(truckModel);

    const currentLocationLabel=document.createElement("label");
    currentLocationLabel.classList.add("label");
    currentLocationLabel.textContent= "CURRENT LOCATION: " + truck.CurrentLocation.toString();
    truckDiv.appendChild(currentLocationLabel);
    
    const destinationLabel=document.createElement("label");
    destinationLabel.classList.add("label");
    destinationLabel.textContent= "DESTINATION: " + truck.FinalDestination.toString();
    truckDiv.appendChild(destinationLabel);

    const speedLabel=document.createElement("label");
    speedLabel.classList.add("label");
    speedLabel.textContent= "CURRENT SPEED: " + truck.CurrentSpeed.toString() + "km/s";
    truckDiv.appendChild(speedLabel);

    const gasLevelLabel=document.createElement("label");
    gasLevelLabel.classList.add("label");
    gasLevelLabel.textContent="GAS LEVEL: " + truck.GasLevel.toString() + "%";
    truckDiv.appendChild(gasLevelLabel);

    if(truck.Status=='inTransit') {
        const trackButton=document.createElement("input");
        trackButton.type="button";
        trackButton.value="TRACK LOCATION";
        truckDiv.appendChild(trackButton);
        
        trackButton.addEventListener('click', async (event) => 
        {
            trackOrder(new Truck(truck));
            //this.trackTruckLocation(truck.id, host);
            // console.log('Gas level: ', truck.GasLevel);
            // console.log('Speed: ', truck.CurrentSpeed);
            // console.log("Location: "  + truck.CurrentLocation);
        })
    }

    console.log("div: ", truckDiv);

}

export function drawTrucks(trucks: Truck[], host: HTMLElement) {
    const trucksContainer = document.createElement("div");
    trucksContainer.classList.add("container-div");
    host.appendChild(trucksContainer);

    for(let t of trucks) {
        const truck=new Truck(t);
        
        drawTruck(truck, trucksContainer);
    }
}


// export function trackOrder(truck: Truck, host: HTMLElement) {
//     const mapDiv=document.createElement("div");
//     host.appendChild(mapDiv);

//     const myMap = new google.maps.Map(mapDiv, 
//         {
//             center: garageLocation,
//             zoom: 7
//         });
    
//     let currentLocationMarker = new google.maps.Marker({
//         position: truck.CurrentLocation,
//         map: myMap
//     });

//     let FinalDestinationMarker = new google.maps.Marker({
//         position: truck.FinalDestination,
//         map: myMap
//     });
// }

export function drawOrder(order: Order, host: HTMLElement, allTrucks?: Truck[], allDrivers?: Driver[]) {
       
    const orderDiv=document.createElement("div");
    orderDiv.classList.add("order-div");
    host.appendChild(orderDiv);

    const orderID=document.createElement("label");
    orderID.classList.add("label");
    orderID.textContent= "ORDER ID: " + order.id.toString();
    orderDiv.appendChild(orderID);
    
    const orderStatus=document.createElement("label");
    orderStatus.classList.add("label");
    orderStatus.textContent= "STATUS: " + order.Status.toUpperCase();
    orderDiv.appendChild(orderStatus);
    
    const totalLoad=document.createElement("label");
    totalLoad.classList.add("label");
    totalLoad.textContent="TOTAL LOAD: " + order.TotalLoad.toString() + "t";
    orderDiv.appendChild(totalLoad);

    const destinationLabel=document.createElement("label");
    destinationLabel.classList.add("label");
    destinationLabel.textContent= "DESTINATION: " + order.Destination.toString();
    orderDiv.appendChild(destinationLabel);

    if(order.Status==='shipped') {
        const trackButton=document.createElement("input");
        trackButton.type="button";
        trackButton.value="TRACK ORDER";
        orderDiv.appendChild(trackButton);
        
        trackButton.addEventListener('click', (event) => 
        {
            getTruck(order.AssignedTruckID).subscribe(response => {
                const truck = new Truck(response);
                trackOrder(truck);
            });
        })
    }
    else if(order.Status==='pending') {
        const shipButton=document.createElement("input");
        shipButton.type="button";
        shipButton.value="SHIP ORDER";
        shipButton.id='shipButtonID';
        orderDiv.appendChild(shipButton);
        
        shipButton.addEventListener('click', (event) => 
        {
            shipOrder(order, allTrucks, allDrivers);
        })
    }

}

export function drawOrders(orders: Order[], host: HTMLElement, allTrucks?: Truck[], allDrivers?: Driver[]) {
    
    const newOrderDiv=document.createElement("div");
    newOrderDiv.classList.add("newOrder-div");
    newOrderDiv.textContent="NEW ORDER";
    host.appendChild(newOrderDiv);
    
    const totalLoadDiv=document.createElement("div");
    newOrderDiv.appendChild(totalLoadDiv);

    const totalLoadLabel=document.createElement("label");
    totalLoadLabel.classList.add("label");
    totalLoadLabel.textContent="TOTAL LOAD:";
    totalLoadDiv.appendChild(totalLoadLabel);
    
    const totalLoadInput=document.createElement("input");
    totalLoadInput.type='number';
    totalLoadInput.classList.add("input");
    totalLoadDiv.appendChild(totalLoadInput);
    
    const destinationDiv= document.createElement("div");
    destinationDiv.classList.add("newOrderDestination-div");
    newOrderDiv.appendChild(destinationDiv);
    
    const destinationLabel=document.createElement("label");
    destinationLabel.classList.add("label");
    destinationLabel.textContent= "ENTER DESTINATION LATITUDE AND LONGITUDE:";
    destinationDiv.appendChild(destinationLabel);
    
    const latInput=document.createElement("input");
    latInput.type='text';
    latInput.classList.add("input");
    destinationDiv.appendChild(latInput);
    
    const lngInput=document.createElement("input");
    lngInput.type='text';
    lngInput.classList.add("input");
    destinationDiv.appendChild(lngInput);

    const newOrderButton = document.createElement("input");
    newOrderButton.type="button";
    newOrderButton.classList.add("newOrder-button");
    newOrderButton.value="PLACE NEW ORDER";
    newOrderDiv.appendChild(newOrderButton);
    
    const ordersContainer=document.createElement("div");
    ordersContainer.classList.add("container-div");
    host.appendChild(ordersContainer);
    
    for(let o of orders) {
        const order=new Order(o);
        if(o.Status==='pending')
            drawOrder(order, ordersContainer, allTrucks, allDrivers);
        else
            drawOrder(order, ordersContainer);
    }

    newOrderButton.addEventListener('click', event => {
        const newOrder = new Order(orders.length, 'pending', parseInt(totalLoadInput.value),
            new google.maps.LatLng(parseFloat( latInput.value), parseFloat(lngInput.value)), "", "");
        orders.push(newOrder);
        newOrderRequest(newOrder);
    })
}

export function drawDriver(driver: Driver, host: HTMLElement) {
       
    const driverDiv=document.createElement("div");
    driverDiv.classList.add("driver-div");
    host.appendChild(driverDiv);

    const driverID=document.createElement("label");
    driverID.classList.add("label");
    driverID.textContent= "DRIVER ID: " + driver.id.toString();
    driverDiv.appendChild(driverID);
    
    // const driverStatus=document.createElement("label");
    // driverStatus.classList.add("label");
    // driverStatus.textContent= "STATUS: " + driver.Status.toUpperCase();
    // driverDiv.appendChild(driverStatus);
    
    const fullNameLabel=document.createElement("label");
    fullNameLabel.classList.add("label");
    fullNameLabel.textContent="FULL NAME: " + driver.FullName;
    driverDiv.appendChild(fullNameLabel);

    const emailLabel=document.createElement("label");
    emailLabel.classList.add("label");
    emailLabel.textContent= "EMAIL: " + driver.Email;
    driverDiv.appendChild(emailLabel);

    const phoneNumberLabel=document.createElement("label");
    phoneNumberLabel.classList.add("label");
    phoneNumberLabel.textContent= "PHONE NUMBER: " + driver.PhoneNumber;
    driverDiv.appendChild(phoneNumberLabel);
    
    if(driver.Status === 'onRoad') {
    
        const assignedTruckLabel=document.createElement("label");
        assignedTruckLabel.classList.add("label");
        assignedTruckLabel.textContent= "ASSIGNED TRUCK: " + driver.AssignedVehicleID;
        driverDiv.appendChild(assignedTruckLabel);

        const trackButton=document.createElement("input");
        trackButton.type="button";
        trackButton.value="TRACK DRIVER";
        driverDiv.appendChild(trackButton);
        
        trackButton.addEventListener('click', (event) => 
        {
            getTruck(driver.AssignedVehicleID).subscribe(response => {
                const truck = new Truck(response);
                trackOrder(truck);
            });
        })
    }

}

export function drawDrivers(drivers: Driver[], host: HTMLElement) {
    const driversContainer = document.createElement("div");
    driversContainer.classList.add("container-div");
    host.appendChild(driversContainer);

    for(let d of drivers) {
        const driver=new Driver(d);

        drawDriver(driver, driversContainer);
    }
}

