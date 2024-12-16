import type { WebhookEventType } from '../../types';

// Types
export type WebhookHandler = (message: any) => void;

export interface ChatPresence {
  phone: string;
  status: string;
  lastSeen: Date;
}

// WebhookEventEmitter class
class WebhookEventEmitter {
  private static instance: WebhookEventEmitter;
  private handlers: Map<WebhookEventType, Set<WebhookHandler>>;

  private constructor() {
    this.handlers = new Map();
  }

  static getInstance(): WebhookEventEmitter {
    if (!WebhookEventEmitter.instance) {
      WebhookEventEmitter.instance = new WebhookEventEmitter();
    }
    return WebhookEventEmitter.instance;
  }

  addHandler(type: WebhookEventType, handler: WebhookHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler);
  }

  removeHandler(type: WebhookEventType, handler: WebhookHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  handleWebhook(data: any): void {
    try {
      const eventType = this.getEventType(data);
      if (!eventType) {
        console.warn('Unknown webhook type:', data.type);
        return;
      }

      const processedData = this.processWebhookData(data);
      if (!processedData) {
        console.warn('Failed to process webhook data');
        return;
      }

      this.emit(eventType, processedData);

    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }

  private emit(type: WebhookEventType, data: any): void {
    const handlers = this.handlers.get(type);
    if (!handlers?.size) {
      console.warn('No handlers registered for webhook type:', type);
      return;
    }

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Handler execution failed:`, error);
      }
    });
  }

  private getEventType(data: any): WebhookEventType | null {
    switch (data.type) {
      case 'ReceivedCallback':
      case 'SentCallback':
      case 'TextMessageCallback':
      case 'ImageMessageCallback':
      case 'VideoMessageCallback':
      case 'AudioMessageCallback':
      case 'DocumentMessageCallback':
        return 'message';
        
      case 'StatusCallback':
      case 'MessageStatusCallback':
      case 'DeliveryCallback':
      case 'ReadCallback':
        return 'status';
        
      case 'PresenceCallback':
      case 'PresenceChatCallback':
        return 'presence';
        
      case 'ConnectedCallback':
      case 'DisconnectedCallback':
        return 'connection';
        
      default:
        return null;
    }
  }

  private processWebhookData(data: any): any | null {
    try {
      return {
        messageId: data.messageId || data.id || data.ids?.[0],
        phone: data.phone,
        fromMe: Boolean(data.fromMe),
        timestamp: new Date(data.momment || data.timestamp),
        type: data.type,
        status: data.status,
        content: this.extractContent(data),
        metadata: {
          chatName: data.chatName,
          senderName: data.senderName,
          senderPhoto: data.senderPhoto || data.photo,
          isGroup: Boolean(data.isGroup)
        }
      };
    } catch (error) {
      console.error('Error processing webhook data:', error);
      return null;
    }
  }

  private extractContent(data: any): any {
    const content: any = {};

    if (data.text) content.text = data.text;
    if (data.image) content.image = data.image;
    if (data.video) content.video = data.video;
    if (data.audio) content.audio = data.audio;
    if (data.document) content.document = data.document;

    return content;
  }
}

// Export singleton instance
export const WebhookHandler = WebhookEventEmitter.getInstance();