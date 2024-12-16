// /src/services/zapi/webhookEndpoint.ts
import { WebhookHandler, WebhookEventType } from './webhookHandler';
import type { ZAPIConfig } from './types';
import { logger } from '@/utils/logger';

interface WebhookRegistration {
  url: string;
  events: WebhookEventType[];
}

class WebhookEndpoint {
  private static instance: WebhookEndpoint;
  private config: ZAPIConfig | null = null;
  private baseUrl = 'https://api.z-api.io';
  private webhookUrl: string;

  private constructor() {
    this.webhookUrl = `${window.location.origin}/webhook`;
  }

  static getInstance(): WebhookEndpoint {
    if (!WebhookEndpoint.instance) {
      WebhookEndpoint.instance = new WebhookEndpoint();
    }
    return WebhookEndpoint.instance;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.config) {
      throw new Error('Webhook endpoint not configured');
    }

    const url = `${this.baseUrl}/instances/${this.config.instanceId}/token/${this.config.token}${endpoint}`;
    
    logger.debug('Making request to Z-API', { endpoint });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': this.config.clientToken,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        logger.error('Request failed', { statusCode: response.status, error: errorData });
        throw new Error(errorData?.message || `Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('Request successful', { data });
      return data;
    } catch (error) {
      logger.error('Request error', { error, endpoint });
      throw error;
    }
  }

  configure(config: ZAPIConfig) {
    this.config = config;
    if (config.webhookUrl) {
      this.webhookUrl = config.webhookUrl;
    }
    logger.info('Webhook endpoint configured', { 
      webhookUrl: this.webhookUrl,
      instanceId: config.instanceId 
    });
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  async register() {
    if (!this.config) {
      throw new Error('Webhook endpoint not configured');
    }

    try {
      logger.info('Registering webhook endpoint');
      const registration: WebhookRegistration = {
        url: this.webhookUrl,
        events: ['message', 'status', 'presence']
      };

      const result = await this.request('/webhook', {
        method: 'POST',
        body: JSON.stringify(registration)
      });

      logger.info('Webhook registered successfully', { url: registration.url });
      return result;
    } catch (error) {
      logger.error('Failed to register webhook', { error });
      throw error;
    }
  }

  async unregister() {
    if (!this.config) {
      return;
    }

    try {
      logger.info('Unregistering webhook endpoint');
      await this.request('/webhook', {
        method: 'DELETE',
        body: JSON.stringify({ url: this.webhookUrl })
      });

      logger.info('Webhook unregistered successfully');
    } catch (error) {
      logger.error('Failed to unregister webhook', { error });
      throw error;
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    try {
      logger.info('Webhook request received');
      
      const data = await req.json();
      
      if (!data) {
        logger.error('No data received in webhook request');
        return new Response('No data received', { status: 400 });
      }

      logger.debug('Processing webhook data', { data });
      await WebhookHandler.handleWebhook(data);

      logger.info('Webhook processed successfully');
      return new Response('OK', { status: 200 });
    } catch (error) {
      logger.error('Error processing webhook request', { error });
      return new Response('Internal server error', { status: 500 });
    }
  }
}

const webhookEndpoint = WebhookEndpoint.getInstance();

export async function setupWebhookEndpoint(config: ZAPIConfig): Promise<(req: Request) => Promise<Response>> {
  try {
    logger.info('Setting up webhook endpoint');
    webhookEndpoint.configure(config);
    await webhookEndpoint.register();
    return webhookEndpoint.handleRequest.bind(webhookEndpoint);
  } catch (error) {
    logger.error('Failed to setup webhook endpoint', { error });
    throw error;
  }
}

export async function removeWebhookEndpoint(): Promise<void> {
  try {
    await webhookEndpoint.unregister();
  } catch (error) {
    logger.error('Failed to remove webhook endpoint', { error });
    throw error;
  }
}