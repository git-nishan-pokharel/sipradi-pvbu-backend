import { Role } from './auth-jwt-payload';
import { IUserValidateResponse } from './user-response';

export interface IRequest extends Request {
  user: IUserValidateResponse;
  role?: Role;
}
