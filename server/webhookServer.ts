import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebhookProcessor } from './services/webhook/webhookProcessor';
import { validateWebhookSignature } from './middleware/security';
import { logger } from './utils/logger';

const app = express();

// Segurança básica
app.use(helmet());

// CORS configurável
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'x-zapi-signature']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.WEBHOOK_RATE_LIMIT_MAX ? parseInt(process.env.WEBHOOK_RATE_LIMIT_MAX) : 100,
  message: { error: 'Too many requests' }
});

app.use(limiter);

// Parser do body com raw buffer para validação de assinatura
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Endpoint de webhook
app.post('/webhook',
  validateWebhookSignature,
  async (req, res) => {
    try {
      logger.info('Webhook received', {
        headers: req.headers,
        body: req.body
      });

      await WebhookProcessor.processWebhook(req);
      
      res.status(200).json({ status: 'success' });
    } catch (error) {
      logger.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.WEBHOOK_PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Webhook server running on port ${PORT}`);
});

export default app;