export interface Device { _id:string; deviceId:string; name:string; isActive:boolean; }
export interface Appliance {
  _id:string; name:string; type:string; isActive:boolean;
  currentStatus?:'ON'|'OFF'; powerRating?:number;
}
export interface ApplianceData {
  _id:string; voltage:number; current:number; power:number;
  status:'ON'|'OFF'; timestamp:string;
}
