import axios from 'axios';

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

export class AuthService {
  private static readonly AUTH_ENDPOINTS = {
    login: `${API_URL}/auth/login`,
    logout: `${API_URL}/auth/logout`,
    refresh: `${API_URL}/auth/refresh`,
    me: `${API_URL}/auth/me`,
  };

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(this.AUTH_ENDPOINTS.login, credentials, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
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
      const response = await axios.get(this.AUTH_ENDPOINTS.me, {
        withCredentials: true
      });
      return response.data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Interceptor para refresh token automático
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

  // Helper para verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    return document.cookie.includes('auth_token=');
  }

  // Configurar handlers de erro globais
  static setupErrorHandlers(onAuthError?: () => void): void {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && onAuthError) {
          onAuthError();
        }
        return Promise.reject(error);
      }
    );
  }
}

// Configurar interceptors por padrão
AuthService.setupAxiosInterceptors();