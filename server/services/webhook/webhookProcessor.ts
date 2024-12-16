import { WebhookHandler } from './handler';
import { logger } from '../../utils/logger';
import type { Request } from 'express';
import type { ZAPIWebhookMessage } from '../zapi/types';

export class WebhookProcessor {
  static async processWebhook(req: Request): Promise<void> {
    try {
      const data = req.body;
      
      // Validar estrutura básica
      if (!this.validateWebhookData(data)) {
        throw new Error('Invalid webhook data structure');
      }

      // Processar diferentes tipos de webhook
      const message = this.processWebhookData(data);
      if (!message) {
        throw new Error('Failed to process webhook data');
      }

      // Emitir evento para os handlers
      WebhookHandler.handleWebhook(message);

      logger.info('Webhook processed successfully', {
        type: message.type,
        messageId: message.messageId
      });

    } catch (error) {
      logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  private static validateWebhookData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    const requiredFields = ['instanceId', 'type'];
    return requiredFields.every(field => data[field] !== undefined);
  }

  private static processWebhookData(data: any): ZAPIWebhookMessage | null {
    try {
      return {
        instanceId: data.instanceId,
        messageId: data.messageId || data.id || data.ids?.[0],
        phone: data.phone,
        fromMe: Boolean(data.fromMe),
        momment: new Date(data.momment || data.timestamp),
        type: data.type,
        status: data.status,
        chatName: data.chatName,
        senderName: data.senderName,
        senderPhoto: data.senderPhoto || data.photo,
        isGroup: Boolean(data.isGroup),
        text: data.text,
        image: data.image,
        document: data.document
      };
    } catch (error) {
      logger.error('Error processing webhook data:', error);
      return null;
    }
  }
}