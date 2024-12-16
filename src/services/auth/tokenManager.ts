// /src/services/auth/tokenManager.ts
import { SignJWT, jwtVerify } from 'jose';
import type { ZAPIConfig } from '../zapi/types';

const SECRET_KEY = import.meta.env.VITE_JWT_SECRET || 'your-development-secret';

export class TokenManager {
  static async encryptTokens(config: ZAPIConfig): Promise<string> {
    try {
      const token = await new SignJWT(config as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(new TextEncoder().encode(SECRET_KEY));
      
      return token;
    } catch (error) {
      console.error('Error encrypting tokens:', error);
      throw new Error('Failed to encrypt tokens');
    }
  }

  static async decryptTokens(token: string): Promise<ZAPIConfig | null> {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(SECRET_KEY)
      );
      
      return payload as ZAPIConfig;
    } catch (error) {
      console.error('Error decrypting tokens:', error);
      return null;
    }
  }

  static async validateTokens(token: string): Promise<boolean> {
    try {
      const config = await this.decryptTokens(token);
      return !!(config?.instanceId && config?.token && config?.clientToken);
    } catch {
      return false;
    }
  }
}