export interface Webhook {
  id: string;
  title: string;
  description?: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  mode: 'test' | 'production';
  config?: WebhookConfig;
}

export interface WebhookConfig {
  fieldMappings: {
    phone?: string;
    name?: string;
    email?: string;
    customFields?: Record<string, string>;
  };
  tags?: string[];
  actions?: WebhookAction[];
}

export type WebhookActionType = 
  | 'addTag'
  | 'updateField'
  | 'addSequence'
  | 'removeSequence'
  | 'sendFlow'
  | 'sendMessage';

export interface WebhookAction {
  id: string;
  type: WebhookActionType;
  config: {
    field?: string;
    value?: string;
    tag?: string;
    note?: string;
    email?: {
      subject: string;
      body: string;
    };
    task?: {
      title: string;
      description: string;
      dueDate?: string;
    };
  };
  order: number;
  rules?: WebhookRule[];
}

export interface WebhookRule {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: string;
  action: 'addTag' | 'setField' | 'skip';
  actionValue?: string;
}

export interface WebhookRequest {
  id: string;
  webhookId: string;
  timestamp: Date;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
}

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  channel: 'whatsapp' | 'instagram' | 'facebook';
  group?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotPayload {
  name: string;
  description?: string;
  channel: Chatbot['channel'];
  group?: string;
}

export interface WebhookPayload {
  title: string;
  description?: string;
}