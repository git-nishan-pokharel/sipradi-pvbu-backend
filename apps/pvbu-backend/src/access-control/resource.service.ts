import { Injectable } from '@nestjs/common';
import { ResourceService } from 'libs/access-control/resource.service';

@Injectable()
export class SipradiPvbuResourceService extends ResourceService {}
