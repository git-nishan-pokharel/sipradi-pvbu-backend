import { Global, Module } from '@nestjs/common';
import { AccessControlModule } from '../../../../libs/access-control/access-control.module';
import { SipradiPvbuAccessPolicyController } from './access-policy.controller';
import { SipradiPvbuAccessPolicyService } from './access-policy.service';
import { AccessValidatorGuard } from 'libs/access-control/guards/access-validator.guard';
import { SipradiPvbuAccessRulesService } from './access-rules.service';
import { SipradiPvbuResourceService } from './resource.service';
import { AccessPolicyService } from 'libs/access-control/access-policy.service';
import { SipradiPvbuAccessRulesController } from './access-rules.controller';
import { SipradiPvbuResourceController } from './resource.controller';

@Global()
@Module({
  imports: [AccessControlModule],
  controllers: [
    SipradiPvbuAccessPolicyController,
    SipradiPvbuAccessRulesController,
    SipradiPvbuResourceController,
  ],
  providers: [
    AccessPolicyService,
    AccessValidatorGuard,
    SipradiPvbuAccessPolicyService,
    SipradiPvbuAccessRulesService,
    SipradiPvbuResourceService,
  ],
  exports: [
    AccessPolicyService,
    AccessValidatorGuard,
    SipradiPvbuAccessPolicyService,
  ],
})
export class SipradiPvbuAccessControlModule {}
