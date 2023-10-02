import { driversURL, ordersURL } from "../../config";
import { Order } from "./order";

export const DriverStatus = {
    available: "available",
    onRoad: "onRoad",
    onBreak: "onBreak"
}

export interface Person {
    id: string,
    FullName: string,
    PhoneNumber: string,
    Email: string
}

export class Driver implements Person {
    id: string;
    FullName: string;
    PhoneNumber: string;
    Email: string;
    Status: string;
    AssignedVehicleID?: string;

    constructor(driverData: Driver) {
            this.id = driverData.id;
            this.FullName=driverData.FullName;
            this.PhoneNumber=driverData.PhoneNumber;
            this.Email=driverData.Email;
            this.Status=driverData.Status;
            this.AssignedVehicleID=driverData.AssignedVehicleID;
        }

    async assignShipment(shipmentID: string) {
        await fetch(ordersURL + shipmentID);
        await fetch(driversURL);
    }

    destinationReachedUpdate() {
      this.Status=DriverStatus.available;
      this.AssignedVehicleID="";
    }

    prepareForRoad(truckId: string) {
      this.Status=DriverStatus.onRoad;
      this.AssignedVehicleID=truckId;
    }

    updateDriverData(newData: Partial<Driver>): void {
        if (newData.hasOwnProperty('id')) {
          this.id = newData.id;
        }
        if (newData.hasOwnProperty('FullName')) {
          this.FullName = newData.FullName;
        }
        if (newData.hasOwnProperty('Email')) {
          this.Email = newData.Email;
        }
        if (newData.hasOwnProperty('PhoneNumber')) {
          this.PhoneNumber = newData.PhoneNumber;
        }
        if (newData.hasOwnProperty('Status')) {
          this.Status = newData.Status;
        }
    }
}
