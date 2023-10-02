import { garageLocation } from "../config";
import { Order } from "./models/order";
import { shipOrder } from "./orderTracking";
import { Driver, DriverStatus } from "./models/person";
import { getTruck, newDriverRequest, newOrderRequest, newTruckRequest, updateDriverRequest, updateOrderRequest, updateTruckRequest } from "./services";
import { Truck } from "./models/vehicle"

export function initializePage(menuDiv: HTMLDivElement, trucksDiv: HTMLDivElement, driversDiv: HTMLDivElement, ordersDiv: HTMLDivElement,
    contentDiv: HTMLDivElement, mapDiv: HTMLDivElement) {

    const mainDiv = document.createElement("div");
    mainDiv.classList.add("main-div");
    mainDiv.id="main";
    document.body.appendChild(mainDiv);
    
    menuDiv.classList.add("menu-div");
    mainDiv.appendChild(menuDiv);
    
    const menuH=document.createElement("h2");
    menuH.classList.add("menu-h");
    menuH.textContent="MENU";
    menuH.style.marginBottom="40px";
    menuDiv.appendChild(menuH);
    
    trucksDiv.classList.add("trucks-div");
    trucksDiv.textContent="TRUCKS";
    menuDiv.appendChild(trucksDiv);

    driversDiv.classList.add("drivers-div");
    driversDiv.textContent="DRIVERS";
    menuDiv.appendChild(driversDiv);

    ordersDiv.classList.add("orders-div");
    ordersDiv.textContent="ORDERS";
    menuDiv.appendChild(ordersDiv);

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

    if(truck.Status==='inTransit') {

        const destinationLabel=document.createElement("label");
        destinationLabel.classList.add("label");
        destinationLabel.textContent= "DESTINATION: " + truck.FinalDestination.toString();
        truckDiv.appendChild(destinationLabel);
    }
    

    const speedLabel=document.createElement("label");
    speedLabel.classList.add("label");
    speedLabel.textContent= "CURRENT SPEED: " + truck.CurrentSpeed.toString() + "km/s";
    truckDiv.appendChild(speedLabel);

    const gasLevelLabel=document.createElement("label");
    gasLevelLabel.classList.add("label");
    gasLevelLabel.textContent="GAS LEVEL: " + truck.GasLevel.toString() + "%";
    truckDiv.appendChild(gasLevelLabel);

    console.log("div: ", truckDiv);

}

export function drawTrucks(trucks: Truck[], host: HTMLElement) {
    const newTruckDiv=document.createElement("div");
    newTruckDiv.classList.add("newOrder-div");
    newTruckDiv.textContent="NEW TRUCK";
    host.appendChild(newTruckDiv);

    const registrationPlateDiv = document.createElement("div");
    newTruckDiv.appendChild(registrationPlateDiv);

    const registrationLabel=document.createElement("label");
    registrationLabel.classList.add("label");
    registrationLabel.textContent="REGISTRATION:";
    registrationPlateDiv.appendChild(registrationLabel);
    
    const registrationInput=document.createElement("input");
    registrationInput.type='string';
    registrationInput.classList.add("input");
    registrationPlateDiv.appendChild(registrationInput);
    
    const maxLoadDiv=document.createElement("div");
    newTruckDiv.appendChild(maxLoadDiv);

    const maxLoadLabel=document.createElement("label");
    maxLoadLabel.classList.add("label");
    maxLoadLabel.textContent="MAXIMUM LOAD:";
    maxLoadDiv.appendChild(maxLoadLabel);
    
    const maxLoadInput=document.createElement("input");
    maxLoadInput.type='number';
    maxLoadInput.classList.add("input");
    maxLoadDiv.appendChild(maxLoadInput);
    
    const modelDiv = document.createElement("div");
    newTruckDiv.appendChild(modelDiv);

    const modelLabel=document.createElement("label");
    modelLabel.classList.add("label");
    modelLabel.textContent="TRUCK MODEL:\n";
    modelDiv.appendChild(modelLabel);
    
    const modelInput=document.createElement("input");
    modelInput.type='string';
    modelInput.classList.add("input");
    modelDiv.appendChild(modelInput);

    const newTruckButton = document.createElement("input");
    newTruckButton.type="button";
    newTruckButton.classList.add("newOrder-button");
    newTruckButton.value="ADD NEW TRUCK";
    newTruckDiv.appendChild(newTruckButton);

    newTruckButton.addEventListener('click', event => {
        const newTruck = new Truck({
            id: registrationInput.value,
            Model: modelInput.value,
            Capacity: parseInt( maxLoadInput.value),
            Load: 0,
            CurrentSpeed: 0,
            GasLevel: 100,
            Status: "idle",
            CurrentLocation: new google.maps.LatLng(garageLocation)
        } as Truck);
        trucks.push(newTruck);
        newTruckRequest(newTruck);
    })

    const trucksContainer = document.createElement("div");
    trucksContainer.classList.add("container-div");
    host.appendChild(trucksContainer);

    for(let t of trucks) {
        const truck=new Truck(t);
        
        drawTruck(truck, trucksContainer);
    }
}

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

    if(order.Status==='pending') {
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
    
    const driverStatus=document.createElement("label");
    driverStatus.classList.add("label");
    driverStatus.textContent= "STATUS: " + driver.Status.toUpperCase();
    driverDiv.appendChild(driverStatus);
    
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
    
    if(driver.Status === DriverStatus.onRoad) {
    
        const assignedTruckLabel=document.createElement("label");
        assignedTruckLabel.classList.add("label");
        assignedTruckLabel.textContent= "ASSIGNED TRUCK: " + driver.AssignedVehicleID;
        driverDiv.appendChild(assignedTruckLabel);

    }

}

export function drawDrivers(drivers: Driver[], host: HTMLElement) {
    const newDriverDiv=document.createElement("div");
    newDriverDiv.classList.add("newOrder-div");
    newDriverDiv.textContent="NEW DRIVER";
    host.appendChild(newDriverDiv);

    const idNumberDiv = document.createElement("div");
    newDriverDiv.appendChild(idNumberDiv);

    const idLabel=document.createElement("label");
    idLabel.classList.add("label");
    idLabel.textContent="ID NUMBER:";
    idNumberDiv.appendChild(idLabel);
    
    const idInput=document.createElement("input");
    idInput.type='string';
    idInput.classList.add("input");
    idNumberDiv.appendChild(idInput);
    
    const nameDiv=document.createElement("div");
    newDriverDiv.appendChild(nameDiv);

    const nameLabel=document.createElement("label");
    nameLabel.classList.add("label");
    nameLabel.textContent="FULL NAME:";
    nameDiv.appendChild(nameLabel);
    
    const nameInput=document.createElement("input");
    nameInput.type='text';
    nameInput.classList.add("input");
    nameDiv.appendChild(nameInput);
    
    const phoneDiv = document.createElement("div");
    newDriverDiv.appendChild(phoneDiv);

    const phoneLabel=document.createElement("label");
    phoneLabel.classList.add("label");
    phoneLabel.textContent="PHONE NUMBER:\n";
    phoneDiv.appendChild(phoneLabel);
    
    const phoneInput=document.createElement("input");
    phoneInput.type='string';
    phoneInput.classList.add("input");
    phoneDiv.appendChild(phoneInput);
    
    const emailDiv = document.createElement("div");
    newDriverDiv.appendChild(emailDiv);

    const emailLabel=document.createElement("label");
    emailLabel.classList.add("label");
    emailLabel.textContent="EMAIL:\n";
    emailDiv.appendChild(emailLabel);
    
    const emailInput=document.createElement("input");
    emailInput.type='string';
    emailInput.classList.add("input");
    emailDiv.appendChild(emailInput);

    const newDriverButton = document.createElement("input");
    newDriverButton.type="button";
    newDriverButton.classList.add("newOrder-button");
    newDriverButton.value="ADD NEW DRIVER";
    newDriverDiv.appendChild(newDriverButton);

    newDriverButton.addEventListener('click', event => {
        const newDriver = new Driver({
            id: idInput.value,
            FullName: nameInput.value,
            PhoneNumber: phoneInput.value,
            Email: emailInput.value,
            Status: "available"
        } as Driver);
        drivers.push(newDriver);
        newDriverRequest(newDriver);
    })

    const driversContainer = document.createElement("div");
    driversContainer.classList.add("container-div");
    host.appendChild(driversContainer);

    for(let d of drivers) {
        const driver=new Driver(d);

        drawDriver(driver, driversContainer);
    }
}

