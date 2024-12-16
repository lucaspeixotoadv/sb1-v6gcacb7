import axios from 'axios';
import { SecurityService } from './security';
import { RateLimiter } from './rateLimiter';

interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Credenciais de desenvolvimento
const DEV_CREDENTIALS = {
  admin: {
    id: '1',
    email: 'lucaspeixoto.adv@gmail.com',
    password: '@Goodly.22476',
    name: 'Administrador',
    role: 'admin'
  },
  agent: {
    id: '2', 
    email: 'agente@example.com',
    password: 'Agente@123',
    name: 'Agente',
    role: 'agent'
  }
} as const;

export class AuthService {
  private static readonly DEV_USERS = DEV_CREDENTIALS;

  private static readonly AUTH_ENDPOINTS = {
    login: `${API_URL}/auth/login`,
    logout: `${API_URL}/auth/logout`,
    refresh: `${API_URL}/auth/refresh`,
    me: `${API_URL}/auth/me`,
  };

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔵 AuthService: Starting login process');
    try {
      const email = credentials.email.trim();
      const password = credentials.password.trim();

      console.log('🔵 AuthService: Attempting login for:', email);

      if (import.meta.env.DEV) {
        console.log('🔵 AuthService: Using development credentials');
        const user = Object.values(this.DEV_USERS).find(u => u.email === email);
        
        if (!user || user.password !== password) {
          console.log('❌ AuthService: Invalid credentials');
          throw new Error('Credenciais inválidas');
        }

        const { password: _, ...userData } = user;
        console.log('✅ AuthService: Login successful for user:', userData.email);
        const tokens = await SecurityService.generateTokens(userData);

        // Reset rate limit after successful login
        RateLimiter.resetLimit(email);

        console.log('✅ AuthService: Returning auth response');
        return {
          user: userData,
          ...tokens
        };
      }

      throw new Error('Production login not implemented');
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Authentication failed');
      }
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await axios.post(this.AUTH_ENDPOINTS.logout, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const response = await axios.post(this.AUTH_ENDPOINTS.refresh, {}, {
        withCredentials: true
      });
      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const savedUser = localStorage.getItem('auth_user');

      if (savedUser) {
        try {
          const decrypted = SecurityService.decryptData(savedUser);
          if (decrypted) {
            return decrypted;
          }
        } catch (error) {
          console.error('Error decrypting stored user:', error);
          localStorage.removeItem('auth_user');
        }
      }

      // Em desenvolvimento, retorna usuário mock apenas se não houver usuário salvo
      if (import.meta.env.DEV) {
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  static setupAxiosInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  static isAuthenticated(): boolean {
    return document.cookie.includes('auth_token=');
  }

  static setupErrorHandlers(onAuthError?: () => void): void {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log error details without the full error object
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (error.response?.status === 401 && onAuthError) {
          console.error('Authentication error:', errorMessage);
          onAuthError();
        }
        return Promise.reject(error);
      }
    );
  }
}

AuthService.setupAxiosInterceptors();