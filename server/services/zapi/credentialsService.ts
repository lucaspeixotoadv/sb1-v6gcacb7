// /server/services/zapi/credentialsService.ts
import { Redis } from 'ioredis';
import { environment } from '../../config/environment';
import { logger } from '../../utils/logger';
import type { ZAPIConfig } from '../../../src/services/zapi/types';

class ZAPICredentialsService {
  private redis: Redis;
  private readonly prefix: string = 'zapi:';
  private readonly EXPIRY_TIME = 60 * 60 * 24 * 30; // 30 dias

  constructor() {
    this.redis = new Redis(environment.redis.url);
  }

  async saveCredentials(userId: string, config: ZAPIConfig): Promise<void> {
    try {
      const key = this.getKey(userId);
      await this.redis.set(
        key,
        JSON.stringify(config),
        'EX',
        this.EXPIRY_TIME
      );

      logger.info('Z-API credentials saved successfully', { userId });
    } catch (error) {
      logger.error('Failed to save Z-API credentials', { userId, error });
      throw new Error('Failed to save Z-API credentials');
    }
  }

  async getCredentials(userId: string): Promise<ZAPIConfig | null> {
    try {
      const key = this.getKey(userId);
      const data = await this.redis.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to retrieve Z-API credentials', { userId, error });
      return null;
    }
  }

  async removeCredentials(userId: string): Promise<void> {
    try {
      const key = this.getKey(userId);
      await this.redis.del(key);
      logger.info('Z-API credentials removed', { userId });
    } catch (error) {
      logger.error('Failed to remove Z-API credentials', { userId, error });
      throw new Error('Failed to remove Z-API credentials');
    }
  }

  private getKey(userId: string): string {
    return `${this.prefix}${userId}:config`;
  }
}

export const zapiCredentialsService = new ZAPICredentialsService();