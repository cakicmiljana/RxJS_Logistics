export enum ShipmentStatus {
    pending="pending",
    shipped="shipped",
    inTransit="inTransit",
    delivered="delivered"
}

export class Shipment {
    ID: number;
    Status: ShipmentStatus;
    TotalLoad: number;
    DueDate: Date;
}