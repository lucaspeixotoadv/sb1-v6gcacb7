import { environment } from '../../config/environment';
import { zapiCredentialsManager } from '../../../src/services/security/zapiCredentialsManager';
import { Redis } from 'ioredis';
import { logger } from '../../utils/logger';

const redis = new Redis(environment.redis.url);
const TOKEN_CACHE_PREFIX = 'zapi:token:valid:';
const TOKEN_CACHE_TTL = 300; // 5 minutos

export class WebhookValidator {
  /**
   * Valida o token do webhook da Z-API
   * @param token Token recebido no header do webhook
   * @returns boolean indicando se o token é válido
   */
  static async validateZAPIToken(token: string): Promise<boolean> {
    try {
      // Verificar cache primeiro
      const cacheKey = `${TOKEN_CACHE_PREFIX}${token}`;
      const cachedResult = await redis.get(cacheKey);
      
      if (cachedResult !== null) {
        return cachedResult === 'true';
      }

      // Buscar todas as credenciais ativas e validar o token
      const allCredentials = await this.getAllActiveCredentials();
      const isValid = allCredentials.some(cred => cred.clientToken === token);

      // Armazenar resultado em cache
      await redis.set(cacheKey, String(isValid), 'EX', TOKEN_CACHE_TTL);

      return isValid;
    } catch (error) {
      logger.error('Error validating Z-API token', { error });
      return false;
    }
  }

  /**
   * Valida a assinatura de um webhook
   * @param data Dados do webhook
   * @param signature Assinatura recebida
   * @returns boolean indicando se a assinatura é válida
   */
  static async validateSignature(data: any, signature: string): Promise<boolean> {
    try {
      // Implementar validação específica da assinatura se necessário
      return true;
    } catch (error) {
      logger.error('Error validating webhook signature', { error });
      return false;
    }
  }

  /**
   * Busca todas as credenciais Z-API ativas
   * @returns Array de credenciais ativas
   */
  private static async getAllActiveCredentials(): Promise<any[]> {
    try {
      // Buscar lista de usuários ativos do Redis
      const userKeys = await redis.keys('zapi:*:config');
      const credentials = [];

      for (const key of userKeys) {
        const credentialData = await redis.get(key);
        if (credentialData) {
          credentials.push(JSON.parse(credentialData));
        }
      }

      return credentials;
    } catch (error) {
      logger.error('Error getting active Z-API credentials', { error });
      return [];
    }
  }

  /**
   * Valida se o webhook está dentro do intervalo de tempo permitido
   * @param timestamp Timestamp do webhook
   * @returns boolean indicando se o timestamp é válido
   */
  static validateTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutos
    return Math.abs(now - timestamp) <= timeWindow;
  }

  /**
   * Valida a origem do webhook
   * @param origin Origem do webhook
   * @returns boolean indicando se a origem é válida
   */
  static validateOrigin(origin: string): boolean {
    return origin === 'https://api.z-api.io';
  }

  /**
   * Invalida o cache de um token específico
   * @param token Token a ser invalidado
   */
  static async invalidateTokenCache(token: string): Promise<void> {
    try {
      const cacheKey = `${TOKEN_CACHE_PREFIX}${token}`;
      await redis.del(cacheKey);
    } catch (error) {
      logger.error('Error invalidating token cache', { error });
    }
  }

  /**
   * Limpa todo o cache de validação de tokens
   */
  static async clearTokenCache(): Promise<void> {
    try {
      const keys = await redis.keys(`${TOKEN_CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Error clearing token cache', { error });
    }
  }
}