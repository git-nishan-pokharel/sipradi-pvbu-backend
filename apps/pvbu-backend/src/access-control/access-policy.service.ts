import { Injectable } from '@nestjs/common';
import { AccessPolicyService } from 'libs/access-control/access-policy.service';

@Injectable()
export class SipradiPvbuAccessPolicyService extends AccessPolicyService {}
