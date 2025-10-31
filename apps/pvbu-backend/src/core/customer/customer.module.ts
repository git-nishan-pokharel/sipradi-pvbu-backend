import { SparrowSmsModule } from '@app/sparrow-sms';
import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { AwsModule } from '@app/aws';
import { SipradiPvbuAccessControlModule } from '@src/access-control/access-control.module';

@Module({
  imports: [SparrowSmsModule, AwsModule, SipradiPvbuAccessControlModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
