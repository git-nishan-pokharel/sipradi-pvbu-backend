import { Injectable } from '@nestjs/common';
import { AccessRulesService } from 'libs/access-control/access-rules.service';

@Injectable()
export class SipradiPvbuAccessRulesService extends AccessRulesService {}
