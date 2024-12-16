// server/auth/types.ts

import { Request } from 'express';

export interface AuthCredentials {
 email: string;
 password: string;
}

export interface User {
 id: string;
 email: string;
 role: UserRole;
 name?: string;
}

export enum UserRole {
 ADMIN = 'admin',
 USER = 'user'
}

export interface AuthResult {
 success: boolean;
 token?: string;
 user?: User;
 error?: string;
}

export interface TokenValidation {
 valid: boolean;
 user?: User;
}

export interface AuthTokenPayload {
 userId: string;
 email: string;
 role: UserRole;
}

export interface AuthenticatedRequest extends Request {
 user?: User;
}

export class AuthError extends Error {
 constructor(
   message: string,
   public statusCode: number = 401
 ) {
   super(message);
   this.name = 'AuthError';
 }
}