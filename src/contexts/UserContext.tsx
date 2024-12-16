import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole, UserStatus } from '../types/users';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserStatus: (status: UserStatus) => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const updateUserStatus = useCallback((status: UserStatus) => {
    setCurrentUser(prev => prev ? {
      ...prev,
      status,
      updatedAt: new Date()
    } : null);
  }, []);

  const updateUserSettings = useCallback((settings: Partial<User['settings']>) => {
    setCurrentUser(prev => prev ? {
      ...prev,
      settings: { ...prev.settings, ...settings },
      updatedAt: new Date()
    } : null);
  }, []);

  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!currentUser) return false;

    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      supervisor: 2,
      agent: 1
    };

    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
  }, [currentUser]);

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      updateUserStatus,
      updateUserSettings,
      hasPermission
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}