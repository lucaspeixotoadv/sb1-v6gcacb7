import { Router, Request, Response } from 'express';
import { WebhookValidator } from '../services/webhook/validator';
import { WebhookProcessor } from '../services/webhook/webhookProcessor';
import { zapiCredentialsManager } from '../../src/services/security/zapiCredentialsManager';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { environment } from '../config/environment';

interface ZAPIWebhookRequest extends Request {
  headers: {
    'z-api-token'?: string;
    'x-request-id'?: string;
    'x-timestamp'?: string;
    'origin'?: string;
  };
  rawBody?: Buffer;
}

const router = Router();
const redis = new Redis(environment.redis.url);

// Rate limiter específico para webhooks
const webhookLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'webhook_limit',
  points: environment.rateLimit.webhook.max,
  duration: environment.rateLimit.webhook.windowMs / 1000
});

// Cache de validações
const validationCache = new Map<string, boolean>();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

async function validateZAPIWebhook(req: ZAPIWebhookRequest): Promise<void> {
  const token = req.headers['z-api-token'];
  const origin = req.headers['origin'];
  const timestamp = req.headers['x-timestamp'];

  // Validar origem
  if (origin !== 'https://api.z-api.io') {
    throw new Error('Invalid webhook origin');
  }
  
  if (!token) {
    throw new Error('Missing Z-API token');
  }

  // Validar timestamp para prevenir replay attacks
  if (timestamp) {
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutos

    if (isNaN(requestTime) || currentTime - requestTime > timeWindow) {
      throw new Error('Request timestamp is too old');
    }
  }

  // Verificar cache
  const cacheKey = `${token}:${JSON.stringify(req.body)}`;
  if (validationCache.has(cacheKey)) {
    return;
  }

  // Validar token com as credenciais armazenadas
  const isValid = await WebhookValidator.validateZAPIToken(token);
  if (!isValid) {
    throw new Error('Invalid Z-API token');
  }

  // Adicionar ao cache
  validationCache.set(cacheKey, true);
  setTimeout(() => validationCache.delete(cacheKey), CACHE_TIMEOUT);
}

async function handleWebhook(req: ZAPIWebhookRequest, res: Response) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Rate limiting
    await webhookLimiter.consume(req.ip);

    // Validar webhook
    await validateZAPIWebhook(req);

    // Processar webhook
    const data = Array.isArray(req.body) ? req.body[0] : req.body;
    await WebhookProcessor.processWebhook(data);

    // Log de sucesso
    logger.info('Z-API webhook processed successfully', { 
      requestId,
      type: data.type,
      messageId: data.body?.messageId,
      duration: Date.now() - startTime
    });
    
    return res.status(200).json({ 
      status: 'success',
      requestId
    });

  } catch (error) {
    // Log do erro
    logger.error('Z-API webhook processing failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body,
      duration: Date.now() - startTime
    });

    // Determinar o status code apropriado
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      switch (error.message) {
        case 'Invalid webhook origin':
        case 'Missing Z-API token':
        case 'Invalid Z-API token':
          statusCode = 401;
          errorMessage = error.message;
          break;
        case 'Request timestamp is too old':
          statusCode = 400;
          errorMessage = error.message;
          break;
        case 'Too many requests':
          statusCode = 429;
          errorMessage = 'Rate limit exceeded';
          break;
      }
    }

    return res.status(statusCode).json({
      status: 'error',
      error: errorMessage,
      requestId
    });
  }
}

// Middleware para preservar o body raw
function rawBodySaver(req: ZAPIWebhookRequest, _: Response, next: Function) {
  req.rawBody = Buffer.from(JSON.stringify(req.body));
  next();
}

// Configurar rota de webhook Z-API
router.post('/webhook/zapi',
  express.json({
    verify: (req: ZAPIWebhookRequest, _, buf) => {
      req.rawBody = buf;
    }
  }),
  asyncHandler(handleWebhook)
);

// Limpar cache periodicamente
setInterval(() => {
  validationCache.clear();
}, CACHE_TIMEOUT);

// Health check para webhook
router.get('/webhook/zapi/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;