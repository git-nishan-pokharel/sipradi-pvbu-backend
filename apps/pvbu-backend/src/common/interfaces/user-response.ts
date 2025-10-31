export interface IUserValidateResponse {
  id: string;
  registeredName: string;
  displayName: string;
  email: string;
  role: string;
  registeredPhoneNumber: string;
  contactPhoneNumber: string;
  password?: string;
  accessId?: number;
}
