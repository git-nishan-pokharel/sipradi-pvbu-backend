import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const canActivate = (await super.canActivate(context)) as boolean;
    if (!canActivate) return false;

    const user = request.user;
    if (!user?.id) return false;

    return true;
  }
}
