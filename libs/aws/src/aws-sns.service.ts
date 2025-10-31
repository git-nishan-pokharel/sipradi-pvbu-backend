import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Logger } from '@nestjs/common';
import { SmsAttributeType } from './models/smsAttribute.type';

export class AwsSNSService {
  private readonly snsClient: SNSClient;

  private readonly logger = new Logger(AwsSNSService.name);

  constructor() {
    this.snsClient = new SNSClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() as string,
      },
      region: process.env.AWS_REGION?.trim() as string,
    });
  }

  public async sendSMSMessage(
    phoneNumber: string,
    message: string,
    type: SmsAttributeType,
  ): Promise<void> {
    try {
      const command = new PublishCommand({
        Message: message,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: type,
          },
        },
      });
      const res = await this.snsClient.send(command);
      this.logger.log(
        'SMS message sent successfully, message ID:',
        res.MessageId,
      );
    } catch (err) {
      this.logger.error('Error sending SMS message', err);
      throw new Error('error in sendSMSMessage');
    }
  }
}
