import { Redis } from 'ioredis';
import { environment } from '../../config/environment';
import { logger } from '../../utils/logger';
import { WebhookEventType } from '../../../src/types';
import Queue from 'bull';

// Types
export type WebhookHandler = (message: any) => Promise<void>;

export interface ChatPresence {
  phone: string;
  status: string;
  lastSeen: Date;
}

interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  timestamp: Date;
  attempts: number;
}

// WebhookEventEmitter class
class WebhookEventEmitter {
  private static instance: WebhookEventEmitter;
  private handlers: Map<WebhookEventType, Set<WebhookHandler>>;
  private redis: Redis;
  private queue: Queue.Queue<WebhookEvent>;
  private readonly MAX_RETRIES = 3;
  private readonly PROCESS_TIMEOUT = 30000; // 30 segundos

  private constructor() {
    this.handlers = new Map();
    
    // Inicializar Redis
    this.redis = new Redis(environment.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    // Inicializar fila
    this.queue = new Queue('webhook-processing', environment.redis.url, {
      defaultJobOptions: {
        attempts: this.MAX_RETRIES,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: this.PROCESS_TIMEOUT
      }
    });

    // Configurar processamento da fila
    this.queue.process(async (job) => {
      return this.processWebhookEvent(job.data);
    });

    // Handlers de eventos da fila
    this.queue.on('failed', (job, err) => {
      logger.error('Webhook processing failed', {
        jobId: job.id,
        webhook: job.data,
        error: err.message,
        attempts: job.attemptsMade
      });
    });

    this.queue.on('completed', (job) => {
      logger.info('Webhook processed successfully', {
        jobId: job.id,
        webhook: job.data,
        attempts: job.attemptsMade
      });
    });
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

    // Log registro do handler
    logger.info('Webhook handler registered', { type });
  }

  async removeHandler(type: WebhookEventType, handler: WebhookHandler): Promise<void> {
    this.handlers.get(type)?.delete(handler);
    logger.info('Webhook handler removed', { type });
  }

  private async emit(event: WebhookEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers?.size) {
      logger.warn('No handlers registered for webhook type', { type: event.type });
      return;
    }

    const promises = Array.from(handlers).map(handler =>
      handler(event.data).catch(error => {
        logger.error('Handler execution failed', {
          type: event.type,
          error: error.message,
          eventId: event.id
        });
        throw error;
      })
    );

    await Promise.allSettled(promises);
  }

  async handleWebhook(webhookData: any): Promise<void> {
    const eventId = crypto.randomUUID();
    
    try {
      logger.info('Webhook received', {
        eventId,
        data: webhookData
      });

      // Validar e processar dados
      const data = Array.isArray(webhookData) ? webhookData[0]?.body : webhookData;
      if (!this.validateWebhookData(data)) {
        throw new Error('Invalid webhook data');
      }
      
      const eventType = this.getEventType(data);
      if (!eventType) {
        throw new Error('Unknown webhook type');
      }

      const processedData = this.processWebhookData(data);
      if (!processedData) {
        throw new Error('Failed to process webhook data');
      }

      // Criar evento
      const event: WebhookEvent = {
        id: eventId,
        type: eventType,
        data: processedData,
        timestamp: new Date(),
        attempts: 0
      };

      // Adicionar à fila de processamento
      await this.queue.add(event, {
        jobId: eventId,
        attempts: this.MAX_RETRIES
      });

      logger.info('Webhook queued successfully', {
        eventId,
        type: eventType
      });

    } catch (error) {
      logger.error('Webhook handling failed', {
        eventId,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: webhookData
      });
      throw error;
    }
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Verificar duplicação
      const isDuplicate = await this.checkDuplicate(event.id);
      if (isDuplicate) {
        logger.warn('Duplicate webhook detected', { eventId: event.id });
        return;
      }

      // Registrar tentativa
      await this.markEventProcessing(event.id);

      // Emitir evento para handlers
      await this.emit(event);

      // Registrar sucesso
      await this.markEventComplete(event.id);

      logger.info('Webhook event processed', {
        eventId: event.id,
        type: event.type,
        duration: Date.now() - startTime
      });

    } catch (error) {
      logger.error('Webhook event processing failed', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  private async checkDuplicate(eventId: string): Promise<boolean> {
    const exists = await this.redis.get(`webhook:${eventId}`);
    return !!exists;
  }

  private async markEventProcessing(eventId: string): Promise<void> {
    await this.redis.set(`webhook:${eventId}:processing`, '1', 'EX', 300); // 5 minutos
  }

  private async markEventComplete(eventId: string): Promise<void> {
    await this.redis.set(`webhook:${eventId}:complete`, '1', 'EX', 86400); // 24 horas
  }

  private validateWebhookData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    const requiredFields = ['instanceId', 'phone', 'type', 'momment'];
    return requiredFields.every(field => data[field] !== undefined);
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
        instanceId: data.instanceId,
        messageId: data.messageId || data.id || data.ids?.[0],
        phone: data.phone,
        fromMe: Boolean(data.fromMe),
        timestamp: new Date(data.momment),
        type: data.type,
        status: data.status,
        content: this.extractContent(data),
        metadata: {
          chatName: data.chatName,
          senderName: data.senderName,
          senderPhoto: data.senderPhoto || data.photo,
          isGroup: Boolean(data.isGroup),
          isStatusReply: Boolean(data.isStatusReply),
          isEdit: Boolean(data.isEdit),
          isNewsletter: Boolean(data.isNewsletter),
          waitingMessage: Boolean(data.waitingMessage),
          broadcast: Boolean(data.broadcast),
          forwarded: Boolean(data.forwarded),
          fromApi: Boolean(data.fromApi)
        }
      };
    } catch (error) {
      logger.error('Error processing webhook data', { error, data });
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