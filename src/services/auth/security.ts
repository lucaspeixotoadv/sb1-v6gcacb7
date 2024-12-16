import { AES, enc, lib, PBKDF2, mode, pad } from 'crypto-js';
import { jwtVerify, SignJWT } from 'jose';

// Função utilitária para determinar o ambiente
const isDevelopment = (): boolean => {
 return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
};

// Função para obter variáveis de ambiente de forma segura
const getEnvValue = (key: string, required: boolean = false): string => {
 let value = '';
 
 if (isDevelopment()) {
   value = import.meta.env[`VITE_${key}`] || '';
 } else {
   value = process.env[key] || '';
 }

 if (required && !value) {
   throw new Error(`Variável de ambiente ${key} é obrigatória`);
 }

 return value;
};

// Configurações de Segurança
const CONFIG = {
 security: {
   jwtSecret: getEnvValue('JWT_SECRET', true),
   encryptionKey: getEnvValue('ENCRYPTION_KEY', true),
   tokenExpiry: getEnvValue('TOKEN_EXPIRY') || '15m',
   refreshTokenExpiry: getEnvValue('REFRESH_TOKEN_EXPIRY') || '7d'
 }
};

// Garante que as chaves tenham 32 caracteres
const SECRET_KEY = CONFIG.security.jwtSecret.padEnd(32, '0');
const ENCRYPTION_KEY = CONFIG.security.encryptionKey.padEnd(32, '0');

// Validação das chaves
if (!isDevelopment() && (!SECRET_KEY || !ENCRYPTION_KEY)) {
 throw new Error('JWT_SECRET e ENCRYPTION_KEY são obrigatórios em produção');
}

export class SecurityService {
 private static readonly IV_LENGTH = 16;
 private static readonly SALT_LENGTH = 16;
 private static readonly STORAGE_PREFIX = 'secure_';
 private static readonly KEY_ITERATIONS = 1000;
 private static readonly KEY_SIZE = 256;

 private static toBase64(str: string): string {
   const encoder = new TextEncoder();
   const data = encoder.encode(str);
   return btoa(String.fromCharCode(...new Uint8Array(data)));
 }

 private static fromBase64(base64: string): string {
   const binary = atob(base64);
   const bytes = new Uint8Array(binary.length);
   for (let i = 0; i < binary.length; i++) {
     bytes[i] = binary.charCodeAt(i);
   }
   return new TextDecoder().decode(bytes);
 }

 static validatePassword(password: string): { isValid: boolean; errors: string[] } {
   const errors: string[] = [];
   
   if (password.length < 8) {
     errors.push('Senha deve ter no mínimo 8 caracteres');
   }
   if (!/[A-Z]/.test(password)) {
     errors.push('Senha deve conter pelo menos uma letra maiúscula');
   }
   if (!/[a-z]/.test(password)) {
     errors.push('Senha deve conter pelo menos uma letra minúscula');
   }
   if (!/[0-9]/.test(password)) {
     errors.push('Senha deve conter pelo menos um número');
   }
   if (!/[!@#$%^&*]/.test(password)) {
     errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*)');
   }

   return {
     isValid: errors.length === 0,
     errors
   };
 }

 static async generateTokens(payload: any): Promise<{ accessToken: string; refreshToken: string }> {
   try {
     const accessToken = await new SignJWT(payload)
       .setProtectedHeader({ alg: 'HS256' })
       .setIssuedAt()
       .setExpirationTime(CONFIG.security.tokenExpiry)
       .sign(new TextEncoder().encode(SECRET_KEY));

     const refreshToken = await new SignJWT(payload)
       .setProtectedHeader({ alg: 'HS256' })
       .setIssuedAt()
       .setExpirationTime(CONFIG.security.refreshTokenExpiry)
       .sign(new TextEncoder().encode(SECRET_KEY));

     return { accessToken, refreshToken };
   } catch (error) {
     if (isDevelopment()) {
       console.error('Token generation failed:', error);
     }
     throw error;
   }
 }

 static async verifyToken(token: string): Promise<any> {
   try {
     const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
     return payload;
   } catch (error) {
     if (isDevelopment()) {
       console.error('Token verification failed:', error);
     }
     return null;
   }
 }

 static async encryptData(data: any): Promise<string> {
   try {
     if (!data) return '';

     const iv = lib.WordArray.random(this.IV_LENGTH);
     const salt = lib.WordArray.random(this.SALT_LENGTH);
     
     const key = PBKDF2(ENCRYPTION_KEY, salt, {
       keySize: this.KEY_SIZE/32,
       iterations: this.KEY_ITERATIONS
     });
     
     const encrypted = AES.encrypt(JSON.stringify(data), key.toString(), {
       iv: iv,
       mode: mode.CBC,
       padding: pad.Pkcs7
     });
     
     const combined = salt.toString() + iv.toString() + encrypted.toString(); 
     return this.toBase64(combined);
   } catch (error) {
     if (isDevelopment()) {
       console.error('Encryption failed:', error);
     }
     return '';
   }
 }

 static async decryptData(encryptedData: string): Promise<any> {
   try {
     if (!encryptedData) return undefined;
     
     const decoded = this.fromBase64(encryptedData);
     
     const salt = enc.Hex.parse(decoded.substr(0, 32));
     const iv = enc.Hex.parse(decoded.substr(32, 32));
     const encrypted = decoded.substring(64);
     
     const key = PBKDF2(ENCRYPTION_KEY, salt, {
       keySize: this.KEY_SIZE/32,
       iterations: this.KEY_ITERATIONS
     });
     
     const bytes = AES.decrypt(encrypted, key.toString(), {
       iv: iv,
       mode: mode.CBC,
       padding: pad.Pkcs7
     });
     
     const decrypted = bytes.toString(enc.Utf8);
     if (!decrypted) return undefined;
     
     return JSON.parse(decrypted);
   } catch (error) {
     if (isDevelopment()) {
       console.error('Decryption failed:', error);
     }
     return undefined;
   }
 }

 static generateSecureId(): string {
   try {
     const array = new Uint8Array(16);
     crypto.getRandomValues(array);
     return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
   } catch (error) {
     if (isDevelopment()) {
       console.error('Secure ID generation failed:', error);
     }
     throw error;
   }
 }
}