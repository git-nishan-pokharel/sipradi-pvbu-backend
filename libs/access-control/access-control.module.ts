import { Module } from '@nestjs/common';
import { AccessPolicyService } from './access-policy.service';
import { AccessRulesService } from './access-rules.service';
import { AccessValidatorGuard } from './guards/access-validator.guard';
import { ResourceService } from './resource.service';

@Module({
  providers: [
    AccessPolicyService,
    AccessRulesService,
    ResourceService,
    AccessValidatorGuard,
  ],
  exports: [AccessPolicyService, AccessValidatorGuard],
})
export class AccessControlModule {}
