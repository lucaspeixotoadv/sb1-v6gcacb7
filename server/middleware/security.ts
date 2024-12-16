import { Request, Response, NextFunction } from 'express';
import { createHash, timingSafeEqual } from 'crypto';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

const redis = new Redis(process.env.REDIS_URL);

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

export async function validateWebhookSignature(
  req: RequestWithRawBody,
  res: Response,
  next: NextFunction
) {
  const signature = req.headers['x-zapi-signature'];
  const timestamp = req.headers['x-timestamp'];

  try {
    // Validar presença da assinatura
    if (!signature || typeof signature !== 'string') {
      throw new Error('Missing webhook signature');
    }

    // Validar timestamp para prevenir replay attacks
    if (timestamp) {
      const requestTime = parseInt(timestamp as string);
      const currentTime = Date.now();
      const timeWindow = 5 * 60 * 1000; // 5 minutos

      if (isNaN(requestTime) || currentTime - requestTime > timeWindow) {
        throw new Error('Request timestamp is too old');
      }
    }

    // Verificar cache de assinaturas
    const cacheKey = `webhook:${signature}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      throw new Error('Duplicate webhook signature');
    }

    // Validar assinatura
    const isValid = verifySignature(req.rawBody || req.body, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Adicionar assinatura ao cache
    await redis.set(cacheKey, '1', 'EX', 300); // 5 minutos

    next();
  } catch (error) {
    logger.error('Webhook validation failed:', error);
    res.status(401).json({ error: error instanceof Error ? error.message : 'Validation failed' });
  }
}

function verifySignature(data: any, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('WEBHOOK_SECRET not configured');
  }

  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const expectedSignature = createHash('sha256')
    .update(payload)
    .update(secret)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature.toLowerCase(), 'hex'),
      Buffer.from(expectedSignature.toLowerCase(), 'hex')
    );
  } catch {
    return false;
  }
}