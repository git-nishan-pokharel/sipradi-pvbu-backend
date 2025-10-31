// src/gpssewa/gpssewa-auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as base64 from 'base-64';
import {
  ImmobilizerDeviceDetail,
  ImmobilizerDeviceDetailsList,
} from './interfaces/gps-device.interfaces';

@Injectable()
export class GpssewaService {
  private readonly gpssewaUrl: string;
  private readonly logger = new Logger(GpssewaService.name);

  constructor(private readonly configService: ConfigService) {
    this.gpssewaUrl = this.configService.get<string>('GPSSEWA_URL') ?? '';
  }

  async login(): Promise<string | null> {
    const email = this.configService.get<string>('GPSSEWA_EMAIL');
    const password = this.configService.get<string>('GPSSEWA_PASSWORD');
    const token = base64.encode(`${email}:${password}`);

    try {
      const res = await axios.post(this.gpssewaUrl + 'auth/login?type=user', {
        provider: 'custom',
        token,
      });

      const accessToken = res.data?.data.token;

      if (!accessToken) {
        throw new Error('No access token in response');
      }

      this.logger.log('Authenticated with GPS Sewa successfully.');
      return accessToken;
    } catch (error) {
      this.logger.error('Failed to authenticate with GPS Sewa:', error.message);
      return null;
    }
  }

  async getDevicePosition(
    token: string,
    deviceId: string,
  ): Promise<ImmobilizerDeviceDetail> {
    try {
      const res = await axios.get(this.gpssewaUrl + `device/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deviceDetail = res.data;
      return deviceDetail;
    } catch (error) {
      this.logger.error('Failed to get Gps position:', error.message);
      throw new Error('Failed to authenticate');
    }
  }

  async getAllDevicesPosition(
    token: string,
  ): Promise<ImmobilizerDeviceDetailsList[]> {
    try {
      const res = await axios.get(this.gpssewaUrl + 'device', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const positionData: ImmobilizerDeviceDetailsList[] = res.data.data;
      return positionData;
    } catch (error) {
      this.logger.error('Failed to get device GPS:', error.message);
      throw new Error('Failed to authenticate');
    }
  }

  async activateImmobilizer(
    token: string,
    deviceId: string,
  ): Promise<{ message: string }> {
    try {
      const res = await axios.post(
        this.gpssewaUrl + `device/${deviceId}/activateShieldMode`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const message = res.data.message;
      return { message };
    } catch (error) {
      this.logger.error('Failed to activate immobilizer', error.message);
      throw new Error('Failed to authenticate');
    }
  }

  async deactivateImmobilizer(
    token: string,
    deviceId: string,
  ): Promise<{ message: string }> {
    try {
      const res = await axios.post(
        this.gpssewaUrl + `device/${deviceId}/deactivateShieldMode`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const message = res.data.message;
      return { message };
    } catch (error) {
      this.logger.error('Failed to deactivate immobilizer', error.message);
      throw new Error('Failed to authenticate');
    }
  }
}
