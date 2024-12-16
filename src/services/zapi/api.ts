// /src/services/zapi/api.ts
import axios from 'axios';
import { logger } from '@/utils/logger';
import type { ZAPIConfig } from './types';

const api = axios.create({
  baseURL: '/api'
});

export class ZAPICredentialsAPI {
  static async saveCredentials(userId: string, config: ZAPIConfig): Promise<void> {
    try {
      await api.post(`/zapi/credentials/${userId}`, config);
      logger.info('Z-API credentials saved successfully');
    } catch (error) {
      logger.error('Failed to save Z-API credentials', { error });
      throw error;
    }
  }

  static async getCredentials(userId: string): Promise<ZAPIConfig | null> {
    try {
      const response = await api.get(`/zapi/credentials/${userId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to retrieve Z-API credentials', { error });
      throw error;
    }
  }

  static async removeCredentials(userId: string): Promise<void> {
    try {
      await api.delete(`/zapi/credentials/${userId}`);
      logger.info('Z-API credentials removed successfully');
    } catch (error) {
      logger.error('Failed to remove Z-API credentials', { error });
      throw error;
    }
  }
}