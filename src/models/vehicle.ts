import { garageLocation, vehiclesURL } from "../../config.js";
import { Order } from "./order.js";

export const VehicleStatus = {
    idle: 'idle',
    inTransit: 'inTransit'
}

export interface Vehicle {
    id: string,
    Model: string,
    Capacity: number,
    CurrentSpeed: number,
    GasLevel: number,
    Status: 'idle' | 'inTransit',
}

export class Truck implements Vehicle {
    id: string;
    Model: string;
    Capacity: number;
    Load: number;
    CurrentSpeed: number;
    GasLevel: number;
    Status: 'idle' | 'inTransit';
    CurrentLocation: google.maps.LatLng;
    FinalDestination?: google.maps.LatLng;

    constructor(order: Truck) {
            this.id=order.id;
            this.Model=order.Model;
            this.Capacity=order.Capacity;
            this.Load=order.Load;
            this.CurrentSpeed=order.CurrentSpeed;
            this.GasLevel=order.GasLevel;
            this.Status=order.Status;
            this.CurrentLocation=new google.maps.LatLng(order.CurrentLocation);
            this.FinalDestination=new google.maps.LatLng(order.FinalDestination);
        }

      updateTruckData(newData: Partial<Truck>): void {
          if (newData.hasOwnProperty('CurrentLocation')) {
            this.CurrentLocation = newData.CurrentLocation;
          }
          if (newData.hasOwnProperty('CurrentSpeed')) {
            this.CurrentSpeed = newData.CurrentSpeed;
          }
          if (newData.hasOwnProperty('GasLevel')) {
            this.GasLevel = newData.GasLevel;
          }
          if (newData.hasOwnProperty('Status')) {
            this.Status = newData.Status;
          }
          if (newData.hasOwnProperty('FinalDestination')) {
            this.FinalDestination = newData.FinalDestination;
          }
      }

      async trackTruckLocation(ID: string, host: HTMLElement) {

          const truckOnMap = new google.maps.Map(host, 
          {
              center: this.CurrentLocation,
              zoom: 4
          });    
          const marker=new google.maps.Marker({
              position: this.CurrentLocation,
              map: truckOnMap
          });

      }

      destinationReachedUpdate() {
        this.Status='idle';
        this.Load=0;
        this.GasLevel=100;
        this.CurrentLocation=new google.maps.LatLng(garageLocation);
        this.FinalDestination= new google.maps.LatLng(garageLocation);
      }

      prepareForTransit(orderLoad: number, destination: google.maps.LatLng) {
          this.Status='inTransit';
          this.Load=orderLoad;
          this.FinalDestination=destination;
      }
        
}