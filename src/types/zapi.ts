// /src/types/zapi.ts
export interface ZAPIMessage {
  instanceId: string;
  messageId: string;
  phone: string;
  connectedPhone: string;
  chatName: string;
  senderName: string;
  isGroup: boolean;
  text: {
    message: string;
  };
  momment: number;
  status: string;
  type: string;
  isStatusReply: boolean;
  isEdit: boolean;
  isNewsletter: boolean;
  waitingMessage: boolean;
  broadcast: boolean;
  forwarded: boolean;
  fromApi: boolean;
  fromMe: boolean;
  senderPhoto?: string | null;
  photo?: string | null;
}

export interface ZAPIWebhookPayload {
  body: ZAPIMessage;
  webhookUrl: string;
  executionMode: 'production' | 'development';
  headers: Record<string, string>;
}

export type ZAPIWebhookEventType = 
  | 'ReceivedCallback'
  | 'SentCallback'
  | 'StatusCallback'
  | 'MessageStatusCallback'
  | 'DeliveryCallback'
  | 'ReadCallback'
  | 'PresenceCallback'
  | 'ConnectedCallback'
  | 'DisconnectedCallback';