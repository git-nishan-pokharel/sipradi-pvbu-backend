import { PrismaService } from '@app/prisma';
import { PrismaRepository } from '@app/prisma/prisma.repository';
import { Injectable } from '@nestjs/common';
import { VehicleModels } from 'apps/pvbu-backend/prisma/generated/prisma/browser';

@Injectable()
export class ErpVehicleService extends PrismaRepository<VehicleModels> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma, 'vehiclemodels');
  }

  async getAllVehicles(): Promise<VehicleModels[]> {
    const result = await super.findAll();
    return result.items;
  }
}
