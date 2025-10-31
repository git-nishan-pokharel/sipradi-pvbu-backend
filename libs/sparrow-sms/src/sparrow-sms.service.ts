import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  SendSparrowSMSRequest,
  SparrowSMSResponse,
} from './models/sparrow.models';

@Injectable()
export class SparrowSMSService {
  private readonly logger = new Logger(SparrowSMSService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly from: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.SPARROW_SMS_BASE_URL as string;
    this.token = process.env.SPARROW_SMS_TOKEN as string;
    this.from = process.env.SPARROW_SMS_FROM as string;

    if (!this.token || !this.from) {
      this.logger.error(
        'SparrowSMS configuration is missing. Please set SPARROW_SMS_BASE_URL, SPARROW_SMS_TOKEN and SPARROW_SMS_FROM',
      );
      throw new Error(
        'SparrowSMS configuration is missing. Please set SPARROW_SMS_BASE_URL, SPARROW_SMS_TOKEN and SPARROW_SMS_FROM',
      );
    }
  }

  /**
   * Send SMS using POST method
   * @param to - Phone number(s) to send SMS to
   * @param text - SMS message content
   * @param customFrom - Optional custom sender ID
   * @returns Promise<SparrowSMSResponse>
   */
  async sendSMS(
    to: string | string[],
    text: string,
    customFrom?: string,
  ): Promise<SparrowSMSResponse> {
    try {
      const phoneNumbers = Array.isArray(to) ? to.join(',') : to;

      const payload: SendSparrowSMSRequest = {
        token: this.token,
        from: customFrom ?? this.from,
        to: phoneNumbers,
        text: text,
      };

      this.logger.log(`Sending SMS to ${phoneNumbers}`);

      const response = await firstValueFrom(
        this.httpService.post<SparrowSMSResponse>(
          `${this.baseUrl}/sms/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const responseData = JSON.stringify(response.data);

      if (response.data.response_code == 200) {
        this.logger.log(`SMS sent successfully: ${responseData}`);
        return response.data;
      } else {
        this.logger.error(`Failed to send SMS: ${responseData}`);
        return response.data;
      }
    } catch (error) {
      this.logger.error('Error sending SMS:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      throw error;
    }
  }
}
