import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Set4nplVehicleResponse } from './interface/emb-data.interface';

@Injectable()
export class Set4nplService {
  private readonly set4nplUrl: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SET4NPL_URL');
    if (!url) {
      throw new Error('SET4NPL_URL environment variable is not set');
    }
    this.set4nplUrl = url;
  }

  async fetchVehicleDataByChassisNumber(
    chassisNumber: string,
  ): Promise<Set4nplVehicleResponse> {
    const response = await axios.get(
      `${this.set4nplUrl}/emb/chassis-number/${chassisNumber}`,
    );

    if (response.status !== 200) {
      throw new NotFoundException('Failed to fetch vehicle data');
    }
    return response.data.data;
  }
}
