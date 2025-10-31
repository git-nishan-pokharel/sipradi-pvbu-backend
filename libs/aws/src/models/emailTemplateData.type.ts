export type AccountCreatedEmailData = {
  company: string;
  name: string;
  email: string;
  setupPasswordUrl: string;
  accountType: string;
  createdDate: string;
  supportEmail: string;
};

export type ResetPasswordEmailData = {
  company: string;
  name: string;
  email: string;
  resetOtp: string;
  supportEmail: string;
};
