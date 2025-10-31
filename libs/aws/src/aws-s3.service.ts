import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';

export class AwsS3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() as string,
      },
      region: process.env.AWS_REGION?.trim() as string,
    });
  }

  public async getS3DefaultUploadUrl(key: string): Promise<string> {
    try {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME as string,
          Key: key,
        }),
        {
          expiresIn: 60,
        },
      );
      Logger.log('s3 Upload Url created');
      return signedUrl;
    } catch (err) {
      Logger.error('Unknown error in creating s3 upload url', err);
      throw new Error('error in getS3DefaultUploadUrl');
    }
  }

  public async getS3DownloadUrl(key: string): Promise<string> {
    try {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME as string,
          Key: key,
        }),
        {
          expiresIn: 60,
        },
      );
      Logger.log('s3 signedDownload Url fetched');
      return signedUrl;
    } catch (err) {
      Logger.error('Unknown error in getS3DownloadUrl', err);
      throw new Error('error in getS3DownloadUrl');
    }
  }

  public async deleteFileFromS3(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME as string,
          Key: key,
        }),
      );
      Logger.log('File deleted from s3 bucket');
      return;
    } catch (error) {
      Logger.error('Unknown Error in deleteFileFromS3', error);
      throw new Error('error in deleteFileFromS3');
    }
  }
}
