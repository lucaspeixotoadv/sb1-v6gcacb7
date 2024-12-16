export class AuthError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR',
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenError extends AuthError {
  constructor(message: string = 'Invalid token') {
    super(message, 'TOKEN_ERROR', 401);
    this.name = 'TokenError';
  }
}

export class RateLimitError extends AuthError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export class RefreshTokenError extends AuthError {
  constructor(message: string = 'Invalid refresh token') {
    super(message, 'REFRESH_TOKEN_ERROR', 401);
    this.name = 'RefreshTokenError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND', 404);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'INVALID_CREDENTIALS', 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class InactiveUserError extends AuthError {
  constructor(message: string = 'User is inactive') {
    super(message, 'INACTIVE_USER', 403);
    this.name = 'InactiveUserError';
  }
}

export class BlacklistedTokenError extends AuthError {
  constructor(message: string = 'Token has been blacklisted') {
    super(message, 'BLACKLISTED_TOKEN', 401);
    this.name = 'BlacklistedTokenError';
  }
}