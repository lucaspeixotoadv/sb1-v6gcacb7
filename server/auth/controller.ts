import { Request, Response } from 'express';
import { AuthService } from './service';
import { logger } from '../utils/logger';
import type { AuthCredentials } from './types';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: AuthCredentials = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const result = await AuthService.authenticate(email, password);
      
      if (!result.success) {
        return res.status(401).json({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Set JWT token in HTTP-only cookie
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      logger.info('User logged in successfully', { email });

      return res.json({
        user: result.user,
        message: 'Logged in successfully'
      });
    } catch (error) {
      logger.error('Login error:', { error });
      return res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      res.clearCookie('auth_token');
      logger.info('User logged out successfully');
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', { error });
      return res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async validateToken(req: Request, res: Response) {
    try {
      const token = req.cookies.auth_token;
      
      if (!token) {
        return res.status(401).json({
          error: 'No token provided',
          code: 'NO_TOKEN'
        });
      }

      const result = await AuthService.validateToken(token);
      
      if (!result.valid) {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.json({
        valid: true,
        user: result.user
      });
    } catch (error) {
      logger.error('Token validation error:', { error });
      return res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}