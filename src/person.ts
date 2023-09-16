import { driversURL, ordersURL } from "../config";

export enum DriverStatus {
    'available',
    'onRoad',
    'onBreak'
}

export interface Person {
    id: string,
    FullName: string,
    PhoneNumber: string,
    Email: string,
    DateOfBirth: Date
}

export class Driver implements Person {
    id: string;
    FullName: string;
    PhoneNumber: string;
    Email: string;
    DateOfBirth: Date;
    // Address: string;
    // Salary: number;
    // LicenceNumber: string;
    Status: 'available' | 'onRoad' | 'onBreak';
    AssignedVehicleID?: string;

    constructor(driverData: Driver) {
            this.id = driverData.id;
            this.FullName=driverData.FullName;
            this.PhoneNumber=driverData.PhoneNumber;
            this.Email=driverData.Email;
            this.DateOfBirth=driverData.DateOfBirth;
            this.Status=driverData.Status;
            this.AssignedVehicleID=driverData.AssignedVehicleID;
        }

    async assignShipment(shipmentID: string) {
        await fetch(ordersURL + shipmentID);
        await fetch(driversURL);
    }

    destinationReachedUpdate() {
      this.Status='available';
      this.AssignedVehicleID="";
    }

    updateDriverData(newData: Partial<Driver>): void {
        if (newData.hasOwnProperty('id')) {
          this.id = newData.id;
        }
        if (newData.hasOwnProperty('FullName')) {
          this.FullName = newData.FullName;
        }
        if (newData.hasOwnProperty('DateOfBirth')) {
          this.DateOfBirth = newData.DateOfBirth;
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
