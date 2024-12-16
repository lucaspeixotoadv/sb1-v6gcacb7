import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

interface AuthenticatedRequest extends Request {
 auth?: {
   apiKey: string;
 };
}

export function authMiddleware(
 req: AuthenticatedRequest, 
 res: Response<ErrorResponse>, 
 next: NextFunction
) {
 const apiKey = req.headers['x-api-key'];

 if (!apiKey || typeof apiKey !== 'string') {
   logger.warn('Missing or invalid API key');
   return res.status(401).json({ 
     error: 'Authentication failed',
     code: 'MISSING_API_KEY'
   });
 }

 if (apiKey !== environment.webhookSecret) {
   logger.warn('Invalid API key provided', {
     providedKey: apiKey.slice(0, 4) + '...'
   });
   return res.status(401).json({ 
     error: 'Authentication failed',
     code: 'INVALID_API_KEY'
   });
 }

 // Attach auth info to request
 req.auth = { apiKey };
 
 next();
}