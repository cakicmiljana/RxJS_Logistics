export enum DriverStatus {
    'available',
    'onRoad',
    'onBreak'
}

export interface Person {
    IDNumber: string,
    FullName: string,
    PhoneNumber: string,
    Email: string,
    DateOfBirth: Date
}

export class Driver implements Person {
    IDNumber: string;
    FullName: string;
    PhoneNumber: string;
    Email: string;
    DateOfBirth: Date;
    // Address: string;
    // Salary: number;
    // LicenceNumber: string;
    Status: DriverStatus;
    AssignedVehicle?: string;

    constructor(id: string, name: string, phone: string, 
        email: string, dateOfBirth: Date, status: DriverStatus, vehicleID?: string) {
            this.IDNumber = id;
            this.FullName=name;
            this.PhoneNumber=phone;
            this.Email=email;
            this.DateOfBirth=dateOfBirth;
            this.Status=status;
            if(vehicleID)
                this.AssignedVehicle=vehicleID;
        }
}