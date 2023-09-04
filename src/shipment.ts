export enum ShipmentStatus {
    pending="pending",
    inTransit="inTransit",
    shipped="shipped",
    delivered="delivered"
}

export class Shipment {
    ID: number;
    Status: ShipmentStatus;
    TotalLoad: number;
    DeliveryDate: Date;
    //WarehouseLocation: google.maps.LatLng;
    Destination: google.maps.LatLng;
    AssignedDriverID: string;
    AssignedVehicleID: string;

    constructor(id: number, status: ShipmentStatus, totalLoad: number, deliveryDate: Date,
        destination: google.maps.LatLng, assignedDriver: string, assignedVehicle: string) {
            this.ID=id;
            this.Status=status;
            this.TotalLoad=totalLoad;
            this.DeliveryDate=deliveryDate;
            this.Destination=destination;
            this.AssignedDriverID=assignedDriver;
            this.AssignedVehicleID=assignedVehicle;
        }
}