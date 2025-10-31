import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessPolicyService } from '../access-policy.service';
import { ACCESS_POLICY_KEY } from '../decorators/access-control.decorator';
import { IAccessPolicyDecorator } from '../enums/access.enum';
import { IUserValidateResponse } from 'apps/pvbu-backend/src/common/interfaces/user-response';

@Injectable()
export class AccessValidatorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessPolicyService: AccessPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const routePoliciesConfig = this.reflector.getAllAndOverride<{
      policy: IAccessPolicyDecorator;
    }>(ACCESS_POLICY_KEY, [context.getHandler(), context.getClass()]);

    if (!routePoliciesConfig) return true;

    const request = context.switchToHttp().getRequest();
    const user = context.switchToHttp().getRequest().user;

    const finalResult = await this.evaluateSinglePolicy(
      routePoliciesConfig.policy,
      user,
    );
    request.query = { ...request.query, ...finalResult.query };

    // eslint-disable-next-line no-console
    console.log('Final Result: ', finalResult);
    if (!finalResult.status) {
      throw new ForbiddenException('Access Denied');
    }
    return finalResult.status;
  }

  private async evaluateSinglePolicy(
    policy: IAccessPolicyDecorator,
    user: Partial<IUserValidateResponse>,
  ): Promise<{ status: boolean; query?: Record<string, unknown> }> {
    const mainResult = await this.accessPolicyService.evaluate(
      user,
      policy.resource,
      policy.action,
    );

    return mainResult;
  }
}
