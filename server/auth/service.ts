// server/auth/service.ts
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcrypt';
import { Pool } from 'pg';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';
import { AuthResult, TokenValidation, User, AuthTokenPayload } from './types';

export class AuthService {
  private static readonly ACCESS_SECRET = new TextEncoder().encode(environment.jwtSecret);
  private static readonly REFRESH_SECRET = new TextEncoder().encode(environment.refreshSecret);
  private static readonly ACCESS_TOKEN_EXP = '15m';
  private static readonly REFRESH_TOKEN_EXP = '7d';
  private static readonly SALT_ROUNDS = 12;

  private static pool: Pool = new Pool({
    connectionString: environment.databaseUrl,
    ssl: {
      rejectUnauthorized: false // Ajuste conforme seu SSL
    }
  });

  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const { rows } = await this.pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      const user = rows[0];
      if (!user) {
        logger.warn('Login attempt failed:', { email });
        return { success: false, error: 'Credenciais inválidas' };
      }

      const passwordMatch = await compare(password, user.password_hash);
      if (!passwordMatch) {
        logger.warn('Invalid password:', { email });
        return { success: false, error: 'Credenciais inválidas' };
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user)
      ]);

      // Salva o refresh token no banco
      await this.saveRefreshToken(user.id, refreshToken);

      logger.info('User authenticated:', { email });
      
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

  private static async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    await this.pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }

  static async validateAccessToken(token: string): Promise<TokenValidation> {
    try {
      const { payload } = await jwtVerify(token, this.ACCESS_SECRET);
      
      const { rows } = await this.pool.query(
        'SELECT * FROM users WHERE id = $1',
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
        WHERE rt.token = $1 AND rt.expires_at > NOW()
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
    await this.pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  private static async generateAccessToken(user: any): Promise<string> {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(this.ACCESS_TOKEN_EXP)
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
      .sign(this.REFRESH_SECRET);
  }

  private static sanitizeUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || null
    };
  }
}