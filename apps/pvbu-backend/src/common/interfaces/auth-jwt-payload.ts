export type AuthJwtPayload = {
  sub: number;
  email: string;
  role: Role;
};

export enum Role {
  admin = 'admin',
  passenger = 'passenger',
  owner = 'owner',
  driver = 'driver',
}
