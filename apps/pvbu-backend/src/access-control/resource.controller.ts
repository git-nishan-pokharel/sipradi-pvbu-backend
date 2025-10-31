import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessValidatorGuard } from 'libs/access-control/guards/access-validator.guard';
import { ResourceController } from 'libs/access-control/resource.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SipradiPvbuResourceService } from './resource.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessValidatorGuard)
@Controller('resource')
export class SipradiPvbuResourceController extends ResourceController {
  constructor(accessPolicyService: SipradiPvbuResourceService) {
    super(accessPolicyService);
  }
}
