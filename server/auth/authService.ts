import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcrypt';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';
import { AuthResult, TokenValidation, User, AuthTokenPayload } from './types';
import { RateLimiterRedis } from 'rate-limiter-flexible';

export class AuthService {
  private static readonly ACCESS_SECRET = new TextEncoder().encode(environment.security.jwtSecret);
  private static readonly REFRESH_SECRET = new TextEncoder().encode(environment.security.refreshSecret);
  private static readonly ACCESS_TOKEN_EXP = environment.security.tokenExpiryTime;
  private static readonly REFRESH_TOKEN_EXP = environment.security.refreshTokenExpiryTime;
  private static readonly SALT_ROUNDS = environment.security.bcryptRounds;

  private static pool: Pool = new Pool({
    connectionString: environment.database.url,
    max: environment.database.maxConnections,
    idleTimeoutMillis: environment.database.idleTimeoutMs,
    connectionTimeoutMillis: environment.database.connectionTimeoutMs,
    ssl: environment.isProduction() ? {
      rejectUnauthorized: true,
      ca: environment.database.sslCert
    } : false
  });

  private static redis = new Redis(environment.redis.url, {
    enableReadyCheck: true,
    maxRetriesPerRequest: 3
  });

  private static rateLimiter = new RateLimiterRedis({
    storeClient: this.redis,
    keyPrefix: 'login_attempts',
    points: 5, // Número de tentativas
    duration: 60 * 15, // Período em segundos (15 minutos)
    blockDuration: 60 * 60 // Tempo de bloqueio em segundos (1 hora)
  });

  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      // Verificar rate limit
      await this.checkRateLimit(email);

      const { rows } = await this.pool.query(
        'SELECT * FROM users WHERE email = $1 AND active = true',
        [email.toLowerCase()]
      );

      const user = rows[0];
      if (!user) {
        await this.penalizeRateLimit(email);
        logger.security('Failed login attempt:', { email });
        return { success: false, error: 'Credenciais inválidas' };
      }

      const passwordMatch = await compare(password, user.password_hash);
      if (!passwordMatch) {
        await this.penalizeRateLimit(email);
        logger.security('Invalid password:', { email });
        return { success: false, error: 'Credenciais inválidas' };
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user)
      ]);

      // Salvar refresh token e invalidar tokens antigos
      await Promise.all([
        this.saveRefreshToken(user.id, refreshToken),
        this.invalidateOldTokens(user.id)
      ]);

      // Registrar login bem-sucedido
      await this.recordSuccessfulLogin(user.id);

      logger.info('User authenticated:', { 
        userId: user.id,
        email: user.email 
      });
      
      return {
        success: true,
        accessToken,
        refreshToken,
        user: this.sanitizeUser(user)
      };
    } catch (error) {
      logger.error('Authentication error:', { error, email });
      throw error;
    }
  }

  private static async checkRateLimit(identifier: string): Promise<void> {
    try {
      await this.rateLimiter.consume(identifier);
    } catch (error) {
      logger.security('Rate limit exceeded:', { identifier });
      throw new Error('Too many login attempts. Please try again later.');
    }
  }

  private static async penalizeRateLimit(identifier: string): Promise<void> {
    try {
      await this.rateLimiter.penalty(identifier, 2); // Penalidade extra por falha
    } catch (error) {
      logger.error('Error applying rate limit penalty:', { error, identifier });
    }
  }

  private static async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      
      // Invalidar tokens antigos
      await client.query(
        'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false',
        [userId]
      );

      // Salvar novo token
      await client.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async validateAccessToken(token: string): Promise<TokenValidation> {
    try {
      // Verificar se token está na blacklist
      const isBlacklisted = await this.redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return { valid: false };
      }

      const { payload } = await jwtVerify(token, this.ACCESS_SECRET);
      
      const { rows } = await this.pool.query(
        'SELECT * FROM users WHERE id = $1 AND active = true',
        [payload.sub]
      );

      if (!rows[0]) {
        return { valid: false };
      }

      return { 
        valid: true, 
        user: this.sanitizeUser(rows[0])
      };
    } catch (error) {
      logger.warn('Token validation failed:', { error });
      return { valid: false };
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    try {
      const { payload } = await jwtVerify(refreshToken, this.REFRESH_SECRET);

      const { rows } = await this.pool.query(`
        SELECT u.* FROM users u
        INNER JOIN refresh_tokens rt ON rt.user_id = u.id
        WHERE rt.token = $1 
        AND rt.expires_at > NOW()
        AND rt.revoked = false
        AND u.active = true
      `, [refreshToken]);

      if (!rows[0]) {
        return { success: false, error: 'Invalid refresh token' };
      }

      const accessToken = await this.generateAccessToken(rows[0]);

      return {
        success: true,
        accessToken,
        user: this.sanitizeUser(rows[0])
      };
    } catch (error) {
      logger.warn('Refresh token validation failed:', { error });
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const { rows } = await client.query(
        'UPDATE refresh_tokens SET revoked = true WHERE token = $1 RETURNING user_id',
        [token]
      );

      if (rows[0]) {
        // Adicionar tokens à blacklist
        await this.blacklistUserTokens(rows[0].user_id);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static async blacklistUserTokens(userId: string): Promise<void> {
    const ttl = 24 * 60 * 60; // 24 horas
    await this.redis.set(`user_blacklist:${userId}`, Date.now(), 'EX', ttl);
  }

  private static async generateAccessToken(user: any): Promise<string> {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: crypto.randomUUID()
    };

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(this.ACCESS_TOKEN_EXP)
      .setJti(crypto.randomUUID())
      .sign(this.ACCESS_SECRET);
  }

  private static async generateRefreshToken(user: any): Promise<string> {
    return await new SignJWT({
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(this.REFRESH_TOKEN_EXP)
      .setJti(crypto.randomUUID())
      .sign(this.REFRESH_SECRET);
  }

  private static sanitizeUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || null,
      lastLogin: user.last_login
    };
  }

  private static async recordSuccessfulLogin(userId: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = $1',
      [userId]
    );
  }

  static async invalidateOldTokens(userId: string): Promise<void> {
    await this.blacklistUserTokens(userId);
  }
}