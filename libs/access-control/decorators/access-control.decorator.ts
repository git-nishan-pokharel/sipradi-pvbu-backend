import { SetMetadata } from '@nestjs/common';
import { IAccessPolicyDecorator } from '../enums/access.enum';

export const ACCESS_POLICY_KEY = 'access_policy_key';

export const AccessControlDecorator = (
  policy: IAccessPolicyDecorator,
): MethodDecorator => SetMetadata(ACCESS_POLICY_KEY, { policy });
