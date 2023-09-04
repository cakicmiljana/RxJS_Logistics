export interface Person {
    IDNumber: string,
    FirstName: string,
    LastName: string,
    PhoneNumber: string,
    Email: string,
    DateOfBirth: Date,
    Address: string,
}

class Driver implements Person {
    IDNumber: string;
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    Email: string;
    DateOfBirth: Date;
    Address: string;
    Salary: number;
    LicenceNumber: string;
    Status: 'available' | 'onRoad' | 'onBreak';
    AssignedVehicle: string;

    constructor(id: string, firstName: string, lastName: string, phone: string, 
        email: string, dateOfBirth: Date, address: string, salary: number, 
        licenceNumber: string, status: "available" | "onRoad" | "onBreak", vehicleID: string) {
            this.IDNumber = id;
            this.FirstName=firstName;
            this.LastName=lastName;
            this.PhoneNumber=phone;
            this.Email=email;
            this.DateOfBirth=dateOfBirth;
            this.Address=address;
            this.Salary=salary;
            this.LicenceNumber=licenceNumber;
            this.Status=status;
            this.AssignedVehicle=vehicleID;
        }
}