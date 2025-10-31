import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class AwsSESService {
  private readonly logger = new Logger(AwsSESService.name);

  private readonly sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() as string,
      },
      region: process.env.AWS_REGION?.trim() as string,
    });
  }

  /**
   * Sends a simple plain text email
   *
   * @param from - The sender's email address (must be verified in AWS SES)
   * @param to - The recipient's email address
   * @param subject - The email subject line
   * @param body - The plain text content of the email
   * @returns Promise<boolean> - Returns true if email sent successfully, false otherwise
   *
   * @example
   * ```typescript
   * const success = await sesService.sendEmail(
   *   'noreply@company.com',
   *   'user@example.com',
   *   'Welcome!',
   *   'Thank you for signing up with us.'
   * );
   * ```
   */
  public async sendEmail(
    from: string,
    to: string,
    subject: string,
    body: string,
  ): Promise<boolean> {
    try {
      const params = {
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: body,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: from,
      };

      const command = new SendEmailCommand(params);
      const emailResult = await this.sesClient.send(command);

      this.logger.log(
        `Email sent successfully. MessageId: ${emailResult.MessageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw new Error('Error sending email');
    }
  }

  /**
   * Sends an HTML email using a template with dynamic data replacement
   *
   * @param from - The sender's email address (must be verified in AWS SES)
   * @param to - The recipient's email address
   * @param subject - The email subject line
   * @param template - HTML template string with placeholders like {{name}}, {{company}}
   * @param data - Object containing key-value pairs to replace template placeholders
   * @returns Promise<boolean> - Returns true if email sent successfully, false otherwise
   *
   * @example
   * ```typescript
   * const success = await sesService.sendTemplateEmail(
   *   'noreply@company.com',
   *   'user@example.com',
   *   'Welcome to Our Platform!',
   *   EmailTemplates.welcome,
   *   {
   *     name: 'John Doe',
   *     company: 'MyCompany',
   *     loginUrl: 'https://app.company.com/login'
   *   }
   * );
   * ```
   */
  public async sendTemplateEmail(
    from: string,
    to: string,
    subject: string,
    template: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      const htmlBody = this.replaceTemplateVariables(template, data);

      const command = new SendEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const result = await this.sesClient.send(command);
      this.logger.log(
        `Template email sent successfully. MessageId: ${result.MessageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to send template email:', error);
      return false;
    }
  }

  /**
   * Replaces template placeholders with actual data values
   *
   * @private
   * @param template - HTML template string containing placeholders like {{variableName}}
   * @param data - Object with key-value pairs where keys match placeholder names
   * @returns string - The template with all placeholders replaced with actual values
   *
   * @example
   * ```typescript
   * // Template: "Hello {{name}}, welcome to {{company}}!"
   * // Data: { name: "John", company: "MyApp" }
   * // Result: "Hello John, welcome to MyApp!"
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private replaceTemplateVariables(
    template: string,
    data: Record<string, any>,
  ): string {
    let result = template;

    Object.keys(data).forEach((key) => {
      const placeholder = `{{${key}}}`;
      const value = data[key] ?? '';
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    return result;
  }
}
