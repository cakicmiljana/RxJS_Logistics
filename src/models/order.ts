import { updateOrderRequest } from "../services";

export const ShipmentStatus = {
    pending: "pending",
    shipped: "shipped",
    delivered: "delivered"
}

export class Order {
    id: number;
    Status: 'pending' | 'shipped' | 'delivered';
    TotalLoad: number;
    Destination: google.maps.LatLng;
    AssignedDriverID: string;
    AssignedTruckID: string;

    constructor(idOrOrderData: number | Order, status?: 'pending' | 'shipped' | 'delivered', totalLoad?: number,
        destination?: google.maps.LatLng, assignedDriver?: string, assignedVehicle?: string) {
            
            if(typeof idOrOrderData === 'number') {
                this.id=idOrOrderData;
                this.Status=status;
                this.TotalLoad=totalLoad;
                this.Destination=destination;
                this.AssignedDriverID=assignedDriver;
                this.AssignedTruckID=assignedVehicle;
            }
            else {
                    this.id=idOrOrderData.id;
                    this.Status=idOrOrderData.Status;
                    this.TotalLoad=idOrOrderData.TotalLoad;
                    this.Destination=new google.maps.LatLng(idOrOrderData.Destination);
                    this.AssignedDriverID=idOrOrderData.AssignedDriverID;
                    this.AssignedTruckID=idOrOrderData.AssignedTruckID;
            }
            
    }

    placeNewOrder(id: number, status: 'pending' | 'shipped' | 'delivered', totalLoad: number,
            destination: google.maps.LatLng, assignedDriver: string, assignedVehicle: string) 
    {
        const newOrder: Order = new Order(id, status, totalLoad, destination, assignedDriver, assignedVehicle);
        updateOrderRequest(this);
    }

    prepareForShipping(truckId: string, driverId: string) {
        this.Status='shipped';
        this.AssignedTruckID=truckId;
        this.AssignedDriverID=driverId;
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

    destinationReachedUpdate() {
        this.Status='delivered';
    }
}