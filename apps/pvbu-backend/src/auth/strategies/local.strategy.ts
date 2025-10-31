import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dto/login.dto';
import { IUserValidateResponse } from '../../common/interfaces/user-response';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'identifier',
      passReqToCallback: true,
    });
  }

  private async validateDto<T extends object>(
    dto: new () => T,
    input: unknown,
  ): Promise<T> {
    const instance = plainToInstance(dto, input);
    const errors = await validate(instance);
    if (errors.length > 0) {
      const messages = errors.flatMap((error) =>
        error.constraints ? Object.values(error.constraints) : [],
      );
      throw new BadRequestException(messages.join('; '));
    }
    return instance;
  }

  async validate(
    req: Request,
    identifier: string,
    password: string,
  ): Promise<IUserValidateResponse> {
    await this.validateDto(LoginDto, req.body);
    const user = await this.authService.validateUser(
      identifier,
      password,
      req?.body?.role,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials'); // Throw error if user is null
    }
    return user;
  }
}
