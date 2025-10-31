export interface ImmobilizerDeviceDetailsList {
  id: string;
  imei: string;
  shieldOn: boolean;
  name: string;
  number: string;
  brand: unknown;
  engine: unknown;
  model: unknown;
  type: string;
  status: string;
  stoppedSince: string;
  lastUpdate: string;
  attributes: Attributes;
  protocol: string;
  latitude: number;
  longitude: number;
  speed: number;
  ignition: boolean;
  course: number;
  address: unknown;
  odometer: number;
  motion: boolean;
  userRole: string;
  dailySummary: DailySummary;
}

export interface Attributes {
  speedLimit: number;
}

export interface DailySummary {
  deviceId: string;
  distance: number;
  averageSpeed: number;
  maxSpeed: number;
  spentFuel: number;
  startOdometer: number;
  endOdometer: number;
  startTime: string;
  endTime: string;
  startHours: number;
  endHours: number;
  entineHours: number;
  createdAt: string;
  updatedAt: string;
}

//single device detail
export interface ImmobilizerDeviceDetail {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  id: Id;
  imei: string;
  traccarDeviceId: number;
  createdAt: string;
  updatedAt: string;
  iDevice: IDevice;
  dailySummary: DailySummary;
  vehicle: Vehicle;
  position: Position;
  status: 'online' | 'offline';
  userRole: string;
}

export interface Id {
  id: number;
  imei: string;
  sim: string;
  model: Model;
}

export interface Model {
  id: number;
  name: string;
}

export interface IDevice {
  id: number;
  imei: string;
  sim: string;
  model: Model2;
}

export interface Model2 {
  id: number;
  name: string;
}

export interface Vehicle {
  deviceId: string;
  name: string;
  number: string;
  vehicleTypeId: number;
  brand: unknown;
  engine: unknown;
  model: unknown;
  companyName: unknown;
  manufactureDate: unknown;
  cylinderCount: unknown;
  horsePower: unknown;
  chasisNumber: unknown;
  engineNumber: unknown;
  color: unknown;
  seatCapacity: unknown;
  type: Type;
}

export interface Type {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  speed: number;
  valid: boolean;
  course: number;
  address: unknown;
  fixTime: string;
  network: Network;
  accuracy: number;
  altitude: number;
  deviceId: number;
  latitude: number;
  outdated: boolean;
  protocol: string;
  longitude: number;
  attributes: Attributes;
  deviceTime: string;
  serverTime: string;
  geofenceIds: unknown;
}

export interface Network {
  radioType: string;
  cellTowers: CellTower[];
  considerIp: boolean;
}

export interface CellTower {
  cellId: number;
  signalStrength: number;
  locationAreaCode: number;
  mobileCountryCode: number;
  mobileNetworkCode: number;
}

export interface Attributes {
  sat: number;
  adc2: number;
  adc3: number;
  door: boolean;
  hdop: number;
  event: number;
  hours: number;
  input: number;
  power: number;
  motion: boolean;
  output: number;
  status: number;
  battery: number;
  distance: number;
  ignition: boolean;
  odometer: number;
  totalDistance: number;
}
