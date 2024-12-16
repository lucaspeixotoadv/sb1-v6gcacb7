import type { ZAPIConfig, ZAPIMessage, ZAPIStatus } from './types';

export class MockZAPIService {
  private instanceId: string;
  private token: string;
  private connected: boolean = false;
  private connectionAttempts: number = 0;

  constructor(config: ZAPIConfig) {
    this.instanceId = config.instanceId;
    this.token = config.token;
  }

  async getStatus(): Promise<ZAPIStatus> {
    return {
      connected: this.connected,
      session: this.connected ? 'connected' : 'disconnected'
    };
  }

  async getQRCode(): Promise<{ qrcode: string }> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.connectionAttempts++;
    
    // Após 3 tentativas, simula conexão bem sucedida
    if (this.connectionAttempts >= 3) {
      this.connected = true;
      return { qrcode: '' };
    }

    // Gera um QR code fake para teste
    return {
      qrcode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`
    };
  }

  async sendMessage(message: ZAPIMessage): Promise<{ messageId: string }> {
    if (!this.connected) {
      throw new Error('WhatsApp não está conectado');
    }

    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      messageId: `mock-${Date.now()}`
    };
  }
}