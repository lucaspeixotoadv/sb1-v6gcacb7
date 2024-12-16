import { AES, enc } from 'crypto-js';
import type { ZAPIConfig } from '../zapi/types';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export class TokenManager {
  private static readonly STORAGE_KEY = 'zapi_tokens_v1';
  private static readonly TOKEN_VERSION = 1;

  static saveTokens(tokens: ZAPIConfig): void {
    if (!ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY not configured');
      return;
    }

    try {
      const data = {
        version: this.TOKEN_VERSION,
        timestamp: Date.now(),
        tokens
      };

      const encrypted = AES.encrypt(
        JSON.stringify(data),
        ENCRYPTION_KEY
      ).toString();

      localStorage.setItem(this.STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new Error('Failed to save tokens');
    }
  }

  static getTokens(): ZAPIConfig | null {
    if (!ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY not configured');
      return null;
    }

    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) return null;

      const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8);
      const data = JSON.parse(decrypted);

      // Valida versão e timestamp
      if (data.version !== this.TOKEN_VERSION) {
        this.clearTokens();
        return null;
      }

      return data.tokens;
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isValid(): boolean {
    const tokens = this.getTokens();
    return !!(
      tokens?.instanceId &&
      tokens?.token &&
      tokens?.clientToken
    );
  }
}