import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

interface SecurityConfig {
  cookieSecret: string;
  webhookSecret: string;
  jwtSecret: string;
  refreshSecret: string;
  encryptionKey: string;
  bcryptRounds: number;
  tokenExpiryTime: string;
  refreshTokenExpiryTime: string;
}

interface DatabaseConfig {
  url: string;
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  ssl: boolean;
}

interface RedisConfig {
  url: string;
  prefix: string;
}

interface WebhookConfig {
  baseUrl: string;
  path: string;
  rateLimit: RateLimitConfig;
}

interface Environment {
  // Server
  port: number;
  nodeEnv: string;
  baseUrl: string;
  maxRequestSize: string;
  requestTimeout: number;
  
  // Security
  security: SecurityConfig;
  
  // Database
  database: DatabaseConfig;
  
  // Redis
  redis: RedisConfig;

  // Webhook
  webhook: WebhookConfig;
  
  // CORS
  corsOrigins: string[];
  
  // Rate Limiting
  rateLimit: {
    global: RateLimitConfig;
    auth: RateLimitConfig;
    webhook: RateLimitConfig;
  };

  // Validation
  validateConfig(): void;
  isProduction(): boolean;
  isDevelopment(): boolean;
}

export const environment: Environment = {
  // Server Configuration
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  maxRequestSize: process.env.MAX_REQUEST_SIZE || '1mb',
  requestTimeout: Number(process.env.REQUEST_TIMEOUT) || 15000,

  // Security Configuration
  security: {
    cookieSecret: process.env.COOKIE_SECRET || '',
    webhookSecret: process.env.WEBHOOK_SECRET || '',
    jwtSecret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.REFRESH_SECRET || '',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
    tokenExpiryTime: process.env.TOKEN_EXPIRY || '15m',
    refreshTokenExpiryTime: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || '',
    maxConnections: Number(process.env.DB_MAX_CONNECTIONS) || 20,
    idleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
    connectionTimeoutMs: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
    ssl: process.env.DB_SSL === 'true'
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    prefix: 'app:'
  },

  // Webhook Configuration
  webhook: {
    baseUrl: process.env.WEBHOOK_BASE_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
    path: '/webhook/zapi',
    rateLimit: {
      windowMs: 60 * 1000,
      max: Number(process.env.WEBHOOK_RATE_LIMIT_MAX) || 100,
      message: 'Too many webhook requests, please try again later'
    }
  },

  // CORS Configuration
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],

  // Rate Limiting Configuration
  rateLimit: {
    global: {
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_MAX) || 100,
      message: 'Too many requests from this IP, please try again later'
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 5,
      message: 'Too many authentication attempts, please try again later'
    },
    webhook: {
      windowMs: 60 * 1000,
      max: Number(process.env.WEBHOOK_RATE_LIMIT_MAX) || 100,
      message: 'Too many webhook requests, please try again later'
    }
  },

  // Helper Methods
  isProduction(): boolean {
    return this.nodeEnv === 'production';
  },

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },

  validateConfig(): void {
    const errors: string[] = [];

    // Validar variáveis obrigatórias
    const requiredVars = {
      'DATABASE_URL': this.database.url,
      'JWT_SECRET': this.security.jwtSecret,
      'REFRESH_SECRET': this.security.refreshSecret,
      'WEBHOOK_SECRET': this.security.webhookSecret,
      'ENCRYPTION_KEY': this.security.encryptionKey,
      'COOKIE_SECRET': this.security.cookieSecret,
      'REDIS_URL': this.redis.url
    };

    Object.entries(requiredVars).forEach(([key, value]) => {
      if (!value) errors.push(`Missing required environment variable: ${key}`);
    });

    // Validações específicas para produção
    if (this.isProduction()) {
      // Validar comprimento mínimo das chaves de segurança
      const securityKeys = {
        'JWT_SECRET': this.security.jwtSecret,
        'REFRESH_SECRET': this.security.refreshSecret,
        'WEBHOOK_SECRET': this.security.webhookSecret,
        'ENCRYPTION_KEY': this.security.encryptionKey,
        'COOKIE_SECRET': this.security.cookieSecret
      };

      Object.entries(securityKeys).forEach(([key, value]) => {
        if (value.length < 32) {
          errors.push(`${key} must be at least 32 characters in production`);
        }
      });

      // Validar HTTPS nas URLs
      if (!this.baseUrl.startsWith('https://')) {
        errors.push('BASE_URL must use HTTPS in production');
      }

      if (!this.webhook.baseUrl.startsWith('https://')) {
        errors.push('WEBHOOK_BASE_URL must use HTTPS in production');
      }

      // Validar origens CORS
      this.corsOrigins.forEach(origin => {
        try {
          const url = new URL(origin);
          if (url.protocol !== 'https:') {
            errors.push(`CORS origin must use HTTPS in production: ${origin}`);
          }
        } catch {
          errors.push(`Invalid CORS origin: ${origin}`);
        }
      });
    }

    // Validar valores numéricos
    if (this.port < 1 || this.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }

    if (this.security.bcryptRounds < 10 || this.security.bcryptRounds > 14) {
      errors.push('BCRYPT_ROUNDS must be between 10 and 14');
    }

    // Se houver erros, lançar exceção
    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Log de configuração bem-sucedida
    logger.info('Environment configuration validated successfully', {
      nodeEnv: this.nodeEnv,
      port: this.port,
      corsOriginsCount: this.corsOrigins.length
    });
  }
};