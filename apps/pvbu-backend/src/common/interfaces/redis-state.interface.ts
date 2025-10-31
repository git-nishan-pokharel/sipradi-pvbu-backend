export interface VehicleState {
  vehicleId: number;
  timestamp: number;
  previousGps: [number, number];
  currentGps: [number, number];
}
