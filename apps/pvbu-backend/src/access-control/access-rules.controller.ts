import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessRulesController } from 'libs/access-control/access-rules.controller';
import { AccessValidatorGuard } from 'libs/access-control/guards/access-validator.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SipradiPvbuAccessRulesService } from './access-rules.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessValidatorGuard)
@Controller('access-rules')
export class SipradiPvbuAccessRulesController extends AccessRulesController {
  constructor(accessPolicyService: SipradiPvbuAccessRulesService) {
    super(accessPolicyService);
  }
}
