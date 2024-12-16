import { Request } from 'express';

// Webhook Types
interface WebhookBody {
  type: string;
  messageId: string;
  phone?: string;
  fromMe?: boolean;
  text?: {
    message: string;
  };
  [key: string]: unknown;
}

export interface WebhookRequest extends Request {
  body: WebhookBody;
  headers: {
    'x-zapi-signature'?: string;
    [key: string]: string | string[] | undefined;
  };
}

// Response Types
export interface ErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

export interface SuccessResponse {
  status: 'success';
  data?: unknown;
}

// API Response Type
export type ApiResponse = SuccessResponse | ErrorResponse;