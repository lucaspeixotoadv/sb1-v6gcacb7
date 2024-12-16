import { useState, useCallback } from 'react';
import type { User, UserRole, UserStatus } from '../types/users';

const INITIAL_USERS: User[] = [];

export function useUsers(initialUsers: User[] = INITIAL_USERS) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const addUser = useCallback((userData: Partial<User>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email!,
      name: userData.name!,
      role: userData.role || 'agent',
      status: 'offline',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        notifications: {
          email: true,
          desktop: true,
          sound: true
        },
        theme: 'light',
        language: 'pt-BR',
        autoAcceptChats: false,
        maxSimultaneousChats: 5
      },
      stats: {
        totalMessages: 0,
        averageResponseTime: 0,
        resolvedChats: 0,
        activeChats: 0,
        satisfaction: 0,
        lastDayStats: {
          messages: 0,
          chats: 0,
          avgResponseTime: 0
        }
      },
      ...userData
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          ...updates,
          updatedAt: new Date()
        };
      }
      return user;
    }));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  const updateUserStatus = useCallback((userId: string, status: UserStatus) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status,
          lastActive: new Date(),
          updatedAt: new Date()
        };
      }
      return user;
    }));
  }, []);

  const getUsersByRole = useCallback((role: UserRole) => {
    return users.filter(user => user.role === role);
  }, [users]);

  const getOnlineUsers = useCallback(() => {
    return users.filter(user => user.status === 'available' || user.status === 'busy');
  }, [users]);

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    getUsersByRole,
    getOnlineUsers
  };
}