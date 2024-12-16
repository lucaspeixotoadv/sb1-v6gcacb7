import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../../services/auth/authService';
import { SecurityService } from '../../services/auth/security';
import type { AuthUser } from '../../services/auth/types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tenta recuperar usuário do localStorage
        const user = await AuthService.getCurrentUser();
        
        if (user) {
          // Valida token antes de autenticar
          const isValid = await SecurityService.verifyToken(user.token);
          if (!isValid) {
            throw new Error('Invalid token');
          }

          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔵 AuthContext: Starting login');
    try {
      setIsLoading(true);
      console.log('🔵 AuthContext: Calling AuthService.login');

      const response = await AuthService.login({ email, password });
      if (!response?.user) {
        console.log('❌ AuthContext: Invalid response - no user data');
        throw new Error('Invalid response from server');
      }

      console.log('✅ AuthContext: Login successful, preparing user data');
      const userData = {
        ...response.user,
        token: response.accessToken,
        refreshToken: response.refreshToken,
        timestamp: Date.now()
      };

      try {
        console.log('🔵 AuthContext: Encrypting user data');
        const encrypted = await SecurityService.encryptData(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, encrypted);
        console.log('✅ AuthContext: User data encrypted and stored');
      } catch (error) {
        console.error('Error encrypting user data:', error);
        // Continue even if encryption fails - user can still login
      }

      console.log('✅ AuthContext: Setting current user and auth state');
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      handleLogout();
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🔵 AuthContext: Login process completed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const logout = async () => {
    AuthService.logout();
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      currentUser,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};