export interface SparrowSMSSuccessResponse {
  count: number;
  response_code: 200;
  response: string;
}

export interface SparrowSMSErrorResponse {
  response_code: number;
  response: string;
}

export type SparrowSMSResponse =
  | SparrowSMSSuccessResponse
  | SparrowSMSErrorResponse;

export interface SendSparrowSMSRequest {
  token: string;
  from: string;
  to: string | string[];
  text: string;
}
