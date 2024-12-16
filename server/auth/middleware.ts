import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errorHandler';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { environment } from '../config/environment';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    permissions?: string[];
    sessionId?: string;
    lastLogin?: Date;
  };
  sessionId?: string;
}

// Redis client para rate limiting
const redis = new Redis(environment.redis.url);

// Rate limiter para autenticação
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'middleware_auth_limit',
  points: environment.rateLimit.auth.max,
  duration: environment.rateLimit.auth.windowMs / 1000,
  blockDuration: 60 * 60 // 1 hora de bloqueio
});

// Cache de tokens inválidos
const invalidTokensCache = new Set<string>();
const CACHE_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hora

// Limpar cache periodicamente
setInterval(() => {
  invalidTokensCache.clear();
}, CACHE_CLEANUP_INTERVAL);

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  try {
    // Rate limiting
    await checkRateLimit(req.ip);

    // Extrair token
    const token = extractToken(req);
    if (!token) {
      throw new AppError(401, 'No token provided', 'NO_TOKEN');
    }

    // Verificar cache de tokens inválidos
    if (invalidTokensCache.has(token)) {
      throw new AppError(401, 'Token is invalid', 'INVALID_TOKEN');
    }

    // Validar token
    const result = await AuthService.validateAccessToken(token);
    
    if (!result.valid || !result.user) {
      invalidTokensCache.add(token);
      throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
    }

    // Verificar se o token não está na blacklist
    const isBlacklisted = await checkTokenBlacklist(token, result.user.id);
    if (isBlacklisted) {
      invalidTokensCache.add(token);
      throw new AppError(401, 'Token revoked', 'TOKEN_REVOKED');
    }

    // Anexar user à request
    req.user = result.user;
    req.sessionId = result.user.sessionId;

    // Headers de segurança
    setSecurityHeaders(res);

    // Log de sucesso
    logAuthSuccess(req, startTime);

    next();
  } catch (error) {
    handleAuthError(error, req, res, requestId, startTime);
  }
}

export function requirePermission(requiredPermissions: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    const hasPermission = permissions.every(permission =>
      req.user?.permissions?.includes(permission)
    );

    if (!hasPermission) {
      logger.security('Permission denied', {
        userId: req.user.id,
        requiredPermissions,
        userPermissions: req.user.permissions,
        path: req.path
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
}

export function requireRole(role: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const roles = Array.isArray(role) ? role : [role];
    
    if (!req.user.role || !roles.includes(req.user.role)) {
      logger.security('Role access denied', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.path
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
}

// Funções auxiliares
async function checkRateLimit(ip: string): Promise<void> {
  try {
    await authLimiter.consume(ip);
  } catch (error) {
    throw new AppError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED');
  }
}

function extractToken(req: AuthenticatedRequest): string | null {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.auth_token;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return cookieToken || null;
}

async function checkTokenBlacklist(token: string, userId: string): Promise<boolean> {
  const blacklisted = await redis.get(`user_blacklist:${userId}`);
  return !!blacklisted;
}

function setSecurityHeaders(res: Response): void {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');
}

function logAuthSuccess(req: AuthenticatedRequest, startTime: number): void {
  logger.info('Authentication successful', {
    userId: req.user?.id,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    duration: Date.now() - startTime
  });
}

function handleAuthError(
  error: any,
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  startTime: number
): void {
  const duration = Date.now() - startTime;

  if (error instanceof AppError) {
    logger.security('Authentication failed', {
      code: error.code,
      message: error.message,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestId,
      duration
    });

    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      requestId
    });
  }

  logger.error('Auth middleware error', {
    error,
    path: req.path,
    ip: req.ip,
    requestId,
    duration
  });

  return res.status(500).json({
    error: 'Internal server error',
    code: 'SERVER_ERROR',
    requestId
  });
}

export const auth = {
  required: authMiddleware,
  requirePermission,
  requireRole
};