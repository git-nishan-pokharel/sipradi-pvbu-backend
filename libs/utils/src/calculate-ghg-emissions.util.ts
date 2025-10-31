import { EEMBType } from '../../../apps/yatri-urban-backend/prisma/generated/client';

const GRID_EMISSION_FACTOR = 0.0000175; // tCO2eq/kWh
const TRANSMISSION_DISTRIBTION_LOSS = 0.1538; // 15.38%
const FUEL_ECONOMY_MINI = 0.932; // kWh/km
const FUEL_ECONOMY_MICRO = 0.423; // kWh/km

/**
 * Calculates the GHG emissions based on the daily travel distance, days per week used,
 * fund disbursed date, and vehicle type.
 *
 * @param {number} dailyTravelDistance - The daily travel distance in kilometers.
 * @param {number} daysPerWeekUsed - The number of days per week the vehicle is used.
 * @param {EEMBType} vehicleType - The type of vehicle (microbus or mini).
 * @returns {Object} An object containing daily and lifetime GHG emissions.
 */
export function calculateDailyGHGEmissions(
  dailyTravelDistance: number,
  daysPerWeekUsed: number,
  vehicleType: EEMBType,
): number {
  const dailyGHGEmissions =
    (GRID_EMISSION_FACTOR / (1 - TRANSMISSION_DISTRIBTION_LOSS)) *
    (vehicleType === EEMBType.microbus
      ? FUEL_ECONOMY_MICRO
      : FUEL_ECONOMY_MINI) *
    dailyTravelDistance *
    (7 / daysPerWeekUsed);

  return dailyGHGEmissions;
}

export function calculateLifetimeGHGEmissions(
  lifetimeTravelDistance: number,
  vehicleType: EEMBType,
): number {
  return (
    (GRID_EMISSION_FACTOR / (1 - TRANSMISSION_DISTRIBTION_LOSS)) *
    (vehicleType === EEMBType.microbus
      ? FUEL_ECONOMY_MICRO
      : FUEL_ECONOMY_MINI) *
    lifetimeTravelDistance
  );
}
