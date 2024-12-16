import { WebhookValidator } from '../security/webhookValidator';
import type { ZAPIWebhookMessage } from './types';

export class WebhookProcessor {
  static async processWebhook(request: Request): Promise<Response> {
    try {
      const signature = request.headers.get('x-zapi-signature');
      if (!signature) {
        return new Response('Missing signature', { status: 401 });
      }

      const data = await request.json();
      
      // Valida assinatura
      if (!WebhookValidator.validateSignature(data, signature)) {
        return new Response('Invalid signature', { status: 401 });
      }

      // Processa o webhook
      const message = this.processWebhookData(data);
      if (!message) {
        return new Response('Invalid webhook data', { status: 400 });
      }

      // Emite evento para os handlers registrados
      WebhookHandler.handleWebhook(message);

      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  private static processWebhookData(data: any): ZAPIWebhookMessage | null {
    try {
      // Valida estrutura básica
      if (!data?.instanceId || !data?.type) {
        return null;
      }

      // Processa diferentes tipos de webhook
      switch (data.type) {
        case 'message':
          return this.processMessageWebhook(data);
        case 'status':
          return this.processStatusWebhook(data);
        case 'presence':
          return this.processPresenceWebhook(data);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error processing webhook data:', error);
      return null;
    }
  }

  private static processMessageWebhook(data: any): ZAPIWebhookMessage {
    return {
      instanceId: data.instanceId,
      messageId: data.messageId,
      phone: data.phone,
      fromMe: data.fromMe || false,
      momment: new Date(data.momment),
      type: 'message',
      chatName: data.chatName,
      senderName: data.senderName,
      senderPhoto: data.senderPhoto,
      isGroup: data.isGroup || false,
      text: data.text,
      image: data.image,
      document: data.document
    };
  }

  private static processStatusWebhook(data: any): ZAPIWebhookMessage {
    return {
      instanceId: data.instanceId,
      messageId: data.messageId,
      phone: data.phone,
      fromMe: true,
      momment: new Date(data.momment),
      type: 'status',
      status: data.status,
      ids: data.ids
    };
  }

  private static processPresenceWebhook(data: any): ZAPIWebhookMessage {
    return {
      instanceId: data.instanceId,
      phone: data.phone,
      fromMe: false,
      momment: new Date(data.momment),
      type: 'presence',
      status: data.status,
      lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined
    };
  }
}