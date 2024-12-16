import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { ErrorResponse } from '../types';

export class AppError extends Error {
 constructor(
   public statusCode: number,
   public message: string,
   public code?: string,
   public details?: unknown
 ) {
   super(message);
   this.name = 'AppError';
 }
}

type AsyncRequestHandler = (
 req: Request,
 res: Response,
 next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
 return (req: Request, res: Response, next: NextFunction) => {
   Promise.resolve(fn(req, res, next)).catch(next);
 };
};

export function errorHandler(
 err: Error | AppError,
 req: Request,
 res: Response<ErrorResponse>,
 next: NextFunction
) {
 logger.error('Error occurred:', {
   name: err.name,
   message: err.message,
   path: req.path,
   method: req.method,
   stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
 });

 if (err instanceof AppError) {
   return res.status(err.statusCode).json({
     error: err.message,
     code: err.code,
     details: err.details
   });
 }

 // Default error
 return res.status(500).json({
   error: 'Internal server error',
   code: 'INTERNAL_ERROR'
 });
}