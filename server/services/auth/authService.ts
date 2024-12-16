import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcrypt';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { environment } from '../../config/environment';
import { logger } from '../../utils/logger';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { TokenManager } from '../security/tokenManager';
import { Encryption } from '../security/encryption';
import {
  AuthError,
  RateLimitError,
  TokenError,
  RefreshTokenError,
  UserNotFoundError,
  InvalidCredentialsError,
  InactiveUserError,
  BlacklistedTokenError
} from './errors';

interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  password_hash: string;
  active: boolean;
}

interface AuthResult {
  success: boolean;
  user?: Omit<User, 'password_hash'>;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

interface TokenValidation {
  valid: boolean;
  user?: Omit<User, 'password_hash'>;
}

export class AuthService {
  private static pool = new Pool({
    connectionString: environment.database.url,
    ssl: environment.database.ssl ? {
      rejectUnauthorized: true,
      ca: environment.database.sslCert
    } : false,
    max: environment.database.maxConnections,
    idleTimeoutMillis: environment.database.idleTimeoutMs,
    connectionTimeoutMillis: environment.database.connectionTimeoutMs
  });

  private static redis = new Redis(environment.redis.url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    }
  });

  private static rateLimiter = new RateLimiterRedis({
    storeClient: AuthService.redis,
    keyPrefix: 'login_attempts',
    points: 5,
    duration: 60 * 15,
    blockDuration: 60 * 60
  });

  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      await this.checkRateLimit(email);

      const { rows } = await this.pool.query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      const user = rows[0];
      if (!user) {
        await this.penalizeRateLimit(email);
        logger.warn('Login attempt failed: user not found', { email });
        throw new UserNotFoundError();
      }

      if (!user.active) {
        logger.warn('Login attempt failed: inactive user', { email });
        throw new InactiveUserError();
      }

      const passwordMatch = await compare(password, user.password_hash);
      if (!passwordMatch) {
        await this.penalizeRateLimit(email);
        logger.warn('Login attempt failed: invalid password', { email });
        throw new InvalidCredentialsError();
      }

      const [accessToken, refreshToken] = await Promise.all([
        TokenManager.generateAccessToken(user),
        TokenManager.generateRefreshToken(user)
      ]);

      await this.saveRefreshToken(user.id, refreshToken);

      const sanitizedUser = this.sanitizeUser(user);
      logger.info('User authenticated successfully', { userId: user.id });

      return {
        success: true,
        user: sanitizedUser,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      logger.error('Authentication error', { error, email });
      throw new AuthError('Authentication failed');
    }
  }

  static async validateToken(token: string): Promise<TokenValidation> {
    try {
      const isBlacklisted = await this.checkTokenBlacklist(token);
      if (isBlacklisted) {
        throw new BlacklistedTokenError();
      }

      const payload = await TokenManager.verifyToken(token);
      if (!payload?.sub) {
        throw new TokenError();
      }

      const { rows } = await this.pool.query<User>(
        'SELECT * FROM users WHERE id = $1 AND active = true',
        [payload.sub]
      );

      if (!rows[0]) {
        throw new UserNotFoundError();
      }

      return {
        valid: true,
        user: this.sanitizeUser(rows[0])
      };
    } catch (error) {
      logger.warn('Token validation failed', { error });
      if (error instanceof AuthError) {
        return { valid: false };
      }
      throw new TokenError();
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const isValid = await this.validateRefreshToken(refreshToken);
      if (!isValid) {
        throw new RefreshTokenError();
      }

      const payload = await TokenManager.verifyToken(refreshToken, true);
      if (!payload?.sub) {
        throw new RefreshTokenError();
      }

      const { rows } = await this.pool.query<User>(
        'SELECT * FROM users WHERE id = $1 AND active = true',
        [payload.sub]
      );

      if (!rows[0]) {
        throw new UserNotFoundError();
      }

      const newAccessToken = await TokenManager.generateAccessToken(rows[0]);
      
      return {
        success: true,
        user: this.sanitizeUser(rows[0]),
        accessToken: newAccessToken
      };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      if (error instanceof AuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      throw new AuthError('Token refresh failed');
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      await this.invalidateRefreshToken(refreshToken);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      throw new AuthError('Logout failed');
    }
  }

  private static async checkRateLimit(identifier: string): Promise<void> {
    try {
      await this.rateLimiter.consume(identifier);
    } catch (error) {
      logger.security('Rate limit exceeded', { identifier });
      throw new RateLimitError();
    }
  }

  private static async penalizeRateLimit(identifier: string): Promise<void> {
    try {
      await this.rateLimiter.penalty(identifier, 2);
    } catch (error) {
      logger.error('Rate limit penalty failed', { error, identifier });
    }
  }

  private static async checkTokenBlacklist(token: string): Promise<boolean> {
    const blacklisted = await this.redis.get(`token:blacklist:${token}`);
    return !!blacklisted;
  }

  private static async saveRefreshToken(userId: string, token: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false',
        [userId]
      );

      await client.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static async validateRefreshToken(token: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()',
      [token]
    );
    return rows.length > 0;
  }

  private static async invalidateRefreshToken(token: string): Promise<void> {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [token]
    );

    // Adicionar à blacklist
    await this.redis.set(
      `token:blacklist:${token}`,
      '1',
      'EX',
      24 * 60 * 60 // 24 horas
    );
  }

  private static sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}