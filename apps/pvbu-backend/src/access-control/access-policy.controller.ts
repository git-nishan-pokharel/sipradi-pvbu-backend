import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessValidatorGuard } from 'libs/access-control/guards/access-validator.guard';
import { AccessPolicyController } from 'libs/access-control/access-policy.controller';
import { SipradiPvbuAccessPolicyService } from './access-policy.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessValidatorGuard)
@Controller('access-policy')
export class SipradiPvbuAccessPolicyController extends AccessPolicyController {
  constructor(accessPolicyService: SipradiPvbuAccessPolicyService) {
    super(accessPolicyService);
  }
}
