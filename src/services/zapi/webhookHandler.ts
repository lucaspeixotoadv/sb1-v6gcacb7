// /src/services/zapi/webhookHandler.ts
import { EventEmitter } from '@/utils/EventEmitter';
import { logger } from '@/utils/logger';
import type { ZAPIMessage } from './types';

export type WebhookEventType = 'message' | 'status' | 'presence' | 'connection';

export type WebhookHandler = (message: ZAPIMessage) => Promise<void>;

class WebhookEventEmitter extends EventEmitter {
  private static instance: WebhookEventEmitter;
  private handlers: Map<WebhookEventType, Set<WebhookHandler>>;

  private constructor() {
    super();
    this.handlers = new Map();
  }

  static getInstance(): WebhookEventEmitter {
    if (!WebhookEventEmitter.instance) {
      WebhookEventEmitter.instance = new WebhookEventEmitter();
    }
    return WebhookEventEmitter.instance;
  }

  async addHandler(type: WebhookEventType, handler: WebhookHandler): Promise<void> {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler);
    logger.info('Webhook handler registered', { type });
  }

  async removeHandler(type: WebhookEventType, handler: WebhookHandler): Promise<void> {
    this.handlers.get(type)?.delete(handler);
    logger.info('Webhook handler removed', { type });
  }

  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const data = Array.isArray(webhookData) ? webhookData[0]?.body : webhookData;
      
      const eventType = this.getEventType(data.type);
      if (!eventType) {
        throw new Error('Unknown webhook type');
      }

      // Emitir evento para os handlers registrados
      const handlers = this.handlers.get(eventType);
      if (handlers?.size) {
        await Promise.all(
          Array.from(handlers).map(handler =>
            handler(data).catch(error => {
              logger.error('Handler execution failed', { type: eventType, error });
            })
          )
        );
      }

      logger.info('Webhook processed', { type: eventType });
    } catch (error) {
      logger.error('Webhook processing failed', { error });
      throw error;
    }
  }

  private getEventType(type: string): WebhookEventType | null {
    switch (type) {
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
}

export const WebhookHandler = WebhookEventEmitter.getInstance();