import { EEMBType } from '../../../../apps/yatri-urban-backend/prisma/generated/client';

export interface Set4nplVehicleResponse {
  id: number;
  chassisNumber: string;
  immobilizerId: string;
  eTicketing: string;
  embType: EEMBType;
  estimatedOperatingDaysPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}
