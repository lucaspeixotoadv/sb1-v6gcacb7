// /src/services/security/zapiCredentialsManager.ts
import { ZAPICredentialsAPI } from '../zapi/api';
import { TokenManager } from '../auth/tokenManager';
import { logger } from '@/utils/logger';
import type { ZAPIConfig } from '../zapi/types';

class ZAPICredentialsManager {
  async saveCredentials(userId: string, config: ZAPIConfig): Promise<void> {
    try {
      // Primeiro, encripta usando JWT
      const encryptedToken = await TokenManager.encryptTokens(config);
      
      // Salva no servidor
      await ZAPICredentialsAPI.saveCredentials(userId, config);

      // Mantém uma cópia local para acesso rápido
      localStorage.setItem(`zapi:${userId}:config`, encryptedToken);

      logger.info('Z-API credentials saved successfully');
    } catch (error) {
      logger.error('Failed to save Z-API credentials', { error });
      throw new Error('Failed to save Z-API credentials');
    }
  }

  async getCredentials(userId: string): Promise<ZAPIConfig | null> {
    try {
      // Primeiro tenta local
      const encryptedToken = localStorage.getItem(`zapi:${userId}:config`);
      if (encryptedToken) {
        const config = await TokenManager.decryptTokens(encryptedToken);
        if (config) return config;
      }

      // Se não encontrar local, busca do servidor
      const config = await ZAPICredentialsAPI.getCredentials(userId);
      if (config) {
        // Atualiza cache local
        const encryptedToken = await TokenManager.encryptTokens(config);
        localStorage.setItem(`zapi:${userId}:config`, encryptedToken);
      }

      return config;
    } catch (error) {
      logger.error('Failed to retrieve Z-API credentials', { error });
      return null;
    }
  }

  async removeCredentials(userId: string): Promise<void> {
    try {
      await ZAPICredentialsAPI.removeCredentials(userId);
      localStorage.removeItem(`zapi:${userId}:config`);
      logger.info('Z-API credentials removed successfully');
    } catch (error) {
      logger.error('Failed to remove Z-API credentials', { error });
      throw new Error('Failed to remove Z-API credentials');
    }
  }
}

export const zapiCredentialsManager = new ZAPICredentialsManager();