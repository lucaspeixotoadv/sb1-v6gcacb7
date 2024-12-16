// /src/types/index.ts
export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  tags: string[];
  notes?: string;
  customFields: { [key: string]: string };
  unread?: boolean;
  lastMessage?: string;
  isTyping?: boolean;
  archived?: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  contactId: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
  mediaUrl?: string;
  messageId?: string;
}

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'datetime';
  required: boolean;
  options?: string[];
}

export interface WebhookEvent {
  event: 'message' | 'status' | 'presence';
  phone: string;
  timestamp: number;
  data: {
    id: string;
    content?: string;
    type?: 'text' | 'image' | 'document';
    status?: 'sent' | 'delivered' | 'read';
  };
}

export interface ZAPIConfig {
  instanceId: string;
  token: string;
  webhookUrl: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  contactId: string;
  stage: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'won' | 'lost';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  tags: string[];
  customFields: { [key: string]: string };
}

export interface Pipeline {
  id: string;
  name: string;
  type: 'sales' | 'support' | 'custom';
  parentId?: string;
  color?: string;
  stages: Stage[];
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  deals: Deal[];
  color?: string;
}

// Novas interfaces Z-API
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