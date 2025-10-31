import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsS3Service } from './aws-s3.service';
import { AwsSESService } from './aws-ses.service';
import { AwsSNSService } from './aws-sns.service';

@Module({
  imports: [ConfigModule],
  providers: [AwsS3Service, AwsSESService, AwsSNSService],
  exports: [AwsS3Service, AwsSESService, AwsSNSService],
})
export class AwsModule {}
