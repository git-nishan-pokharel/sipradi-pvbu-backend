import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
      },
      region: process.env.AWS_REGION?.trim(),
    });
  }

  public async getPresignedUploadURL(key: string): Promise<string> {
    try {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        }),
        {
          expiresIn: 60,
        },
      );
      Logger.log('Presigned upload url created.');
      return signedUrl;
    } catch (err) {
      Logger.error('Error occurred while creating upload url', err);
      throw new Error('Error in getPresignedUploadURL');
    }
  }

  public async getPresignedAccessURL(key: string): Promise<string> {
    try {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        }),
        {
          expiresIn: 60,
        },
      );
      Logger.log('Presigned access url created.');
      return signedUrl;
    } catch (err) {
      Logger.error('Error occurred while creating access url.', err);
      throw new Error('Error in getPresignedAccessURL');
    }
  }

  public async deleteFileFromS3(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        }),
      );
      Logger.log('File deleted from cloud');
      return;
    } catch (error) {
      Logger.error('Unknown Error in deleteFileFromS3', error);
      throw new Error('error in deleteFileFromS3');
    }
  }
}
