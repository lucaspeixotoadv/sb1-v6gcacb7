import { AES, enc } from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-development-key';

class TokenEncryptionService {
  encrypt(value: string): string {
    try {
      return AES.encrypt(value, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encrypted: string): string {
    try {
      const bytes = AES.decrypt(encrypted, ENCRYPTION_KEY);
      return bytes.toString(enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  validateKey(): boolean {
    return ENCRYPTION_KEY.length >= 32;
  }
}

export const TokenEncryption = new TokenEncryptionService();