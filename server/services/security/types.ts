export interface EncryptedData {
  value: string;
  iv: string;
  timestamp: number;
}

export interface TokenData {
  value: string;
  expiresAt: number;
}

export interface SecurityConfig {
  encryptionKey: string;
  tokenExpiration: number;
  webhookSecret: string;
}