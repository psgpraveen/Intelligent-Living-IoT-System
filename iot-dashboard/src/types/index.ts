export interface Device {
  _id: string;
  deviceId: string;
  name: string;
  isActive: boolean;
}

export interface ApplianceData {
  _id: string;
  voltage: number;
  current: number;
  power: number;
  status: 'ON' | 'OFF';
  timestamp: string;
  [key: string]: string | number; // Enables dynamic property access
}

export interface Appliance {
  _id: string;
  name: string;
  type: string;
  isActive?: boolean;
  deviceId: string;
  powerRating?: number;
  currentStatus?: 'ON' | 'OFF';
  powerThresholdLow?: number;
  powerThresholdHigh?: number;
}
