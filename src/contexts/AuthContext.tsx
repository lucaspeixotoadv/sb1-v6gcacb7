```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/auth/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Verifica autenticação ao iniciar
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const success = AuthService.login(email, password);
      if (success) {
        setCurrentUser(email);
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!currentUser,
      isLoading,
      currentUser,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```