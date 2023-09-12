import { updateOrderRequest } from "./services";

export enum ShipmentStatus {
    pending="pending",
    shipped="shipped",
    delivered="delivered"
}

export class Order {
    id: number;
    Status: 'pending' | 'shipped' | 'delivered';
    TotalLoad: number;
    // DeliveryDate: Date;
    Destination: google.maps.LatLng;
    AssignedDriverID: string;
    AssignedTruckID: string;

    constructor(id: number, status: 'pending' | 'shipped' | 'delivered', totalLoad: number,
        destination: google.maps.LatLng, assignedDriver: string, assignedVehicle: string) {
            this.id=id;
            this.Status=status;
            this.TotalLoad=totalLoad;
            // this.DeliveryDate=deliveryDate;
            this.Destination=destination;
            this.AssignedDriverID=assignedDriver;
            this.AssignedTruckID=assignedVehicle;
    }

    placeNewOrder(id: number, status: 'pending' | 'shipped' | 'delivered', totalLoad: number,
            destination: google.maps.LatLng, assignedDriver: string, assignedVehicle: string) {
        const newOrder: Order = new Order(id, status, totalLoad, destination, assignedDriver, assignedVehicle);
        updateOrderRequest(this);
    }

    updateOrderData(newOrderData: Partial<Order>): void {
        if (newOrderData.hasOwnProperty('Status')) {
          this.Status = newOrderData.Status;
        }
        if (newOrderData.hasOwnProperty('TotalLoad')) {
          this.TotalLoad = newOrderData.TotalLoad;
        }
        if (newOrderData.hasOwnProperty('Destination')) {
          this.Destination = newOrderData.Destination;
        }
        if(newOrderData.hasOwnProperty('AssignedDriverID')) {
            this.AssignedDriverID = newOrderData.AssignedDriverID;
        }
        if(newOrderData.hasOwnProperty('AssignedTruckID')) {
            this.AssignedTruckID = newOrderData.AssignedTruckID;
        }
    }

    drawOrder(host: HTMLElement) {

    }
}