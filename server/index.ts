import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import timeout from 'connect-timeout';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { environment } from './config/environment';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './auth/routes';
import webhookRoutes from './routes/webhook';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ErrorResponse, SuccessResponse } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate environment variables
try {
  environment.validateConfig();
} catch (error) {
  logger.error('Environment validation failed:', {
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  process.exit(1);
}

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: environment.nodeEnv === 'production' ? 100 : 0, // limite por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Request timeout
app.use(timeout('15s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Compression for responses
app.use(compression());

// CORS configuration
app.use(cors({
  origin: environment.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'x-zapi-signature',
    'x-api-key',
    'Authorization'
  ],
  exposedHeaders: ['Content-Type'],
  credentials: true,
  maxAge: 86400, // 24 horas
}));

// Request logging
app.use(morgan('combined', {
  stream: { 
    write: (message) => logger.info(message.trim(), { source: 'http' })
  },
  skip: (req) => req.path === '/health'
}));

// Request parsing
app.use(express.json({
  limit: '1mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf; // Para validação de webhook
  }
}));

// Cookie parser for auth tokens
app.use(cookieParser());

// Health check com informações básicas
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: environment.nodeEnv,
    uptime: process.uptime()
  });
});

// Apply rate limiting to all routes except webhooks
app.use(/^\/(?!api\/webhook).*$/, limiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', webhookRoutes);

// Production setup
if (environment.nodeEnv === 'production') {
  const clientPath = join(__dirname, '../../dist/client');
  app.use(express.static(clientPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  app.get('*', (_, res) => {
    res.sendFile(join(clientPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Start server
const port = environment.port;
const server = app.listen(port, () => {
  logger.info(`Server started`, {
    port,
    env: environment.nodeEnv,
    cors: environment.corsOrigins,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error,
  });
  process.exit(1);
});

export default app;