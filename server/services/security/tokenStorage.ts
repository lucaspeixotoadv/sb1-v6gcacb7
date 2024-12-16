import { TokenEncryption } from './encryption';
import type { TokenData } from './types';

export class TokenStorage {
  private static readonly STORAGE_KEY = 'secure_tokens';
  private static readonly TOKEN_VERSION = 1;

  static saveToken(key: string, value: string, expiresIn?: number): void {
    try {
      const token: TokenData = {
        value,
        expiresAt: expiresIn ? Date.now() + expiresIn : 0
      };

      const encrypted = TokenEncryption.encrypt(JSON.stringify(token));
      localStorage.setItem(`${this.STORAGE_KEY}:${key}`, encrypted);
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error('Failed to save token');
    }
  }

  static getToken(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(`${this.STORAGE_KEY}:${key}`);
      if (!encrypted) return null;

      const decrypted = TokenEncryption.decrypt(encrypted);
      const token: TokenData = JSON.parse(decrypted);

      if (token.expiresAt && token.expiresAt < Date.now()) {
        this.removeToken(key);
        return null;
      }

      return token.value;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  static removeToken(key: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}:${key}`);
  }

  static clearAllTokens(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.STORAGE_KEY))
      .forEach(key => localStorage.removeItem(key));
  }
}