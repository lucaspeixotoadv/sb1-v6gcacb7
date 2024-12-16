export interface ZAPIConfig {
  instanceId: string;
  token: string;
  clientToken: string;
  webhookUrl: string;
}

export interface ZAPIStatus {
  connected: boolean;
  session: 'connected' | 'disconnected' | 'connecting';
  lastSeen?: Date;
  battery?: number;
  phone?: string;
}

export interface ZAPIMessage {
  phone: string;
  message: string;
  type?: 'text' | 'image' | 'document' | 'video';
  mediaUrl?: string;
}
export type WebhookCallbackType = 
  | 'ReceivedCallback'
  | 'SentCallback' 
  | 'MessageStatusCallback'
  | 'DeliveryCallback'
  | 'ReadCallback'
  | 'PresenceCallback'
  | 'PresenceChatCallback'
  | 'DisconnectedCallback'
  | 'ConnectedCallback';

export interface ZAPIWebhookMessage {
  instanceId: string;
  messageId?: string;
  phone: string;
  fromMe: boolean;
  momment: Date;
  type: WebhookCallbackType;
  status?: string;
  chatName?: string;
  senderName?: string;
  senderPhoto?: string;
  isGroup?: boolean;
  text?: {
    message: string;
  };
  image?: {
    url: string;
    caption?: string;
  };
  document?: {
    url: string;
    filename: string;
  };
  ids?: string[];
}