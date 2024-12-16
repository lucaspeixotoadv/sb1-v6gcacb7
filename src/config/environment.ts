// /src/config/environment.ts
interface RedisConfig {
  url: string;
  prefix: string;
}

interface Environment {
  // Ambiente
  isProduction: boolean;
  isDevelopment: boolean;
  baseUrl: string;

  // Redis
  redis: RedisConfig;

  // Webhook
  webhook: {
    baseUrl: string;
    path: string;
  };
}

export const environment: Environment = {
  // Ambiente
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

  // Redis
  redis: {
    url: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
    prefix: 'app:'
  },

  // Webhook
  webhook: {
    baseUrl: import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:3000',
    path: '/webhook/zapi'
  }
};