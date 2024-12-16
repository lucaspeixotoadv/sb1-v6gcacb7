import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Team, ChatQueue } from '../types/chat';
import { useUser } from './UserContext';

interface TeamContextType {
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
  queue: ChatQueue | null;
  updateQueue: (queue: ChatQueue) => void;
  isSupervisor: boolean;
  canManageTeam: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, hasPermission } = useUser();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [queue, setQueue] = useState<ChatQueue | null>(null);

  const updateQueue = useCallback((newQueue: ChatQueue) => {
    setQueue(newQueue);
  }, []);

  const isSupervisor = currentTeam?.supervisorId === currentUser?.id;
  const canManageTeam = hasPermission('admin') || isSupervisor;

  return (
    <TeamContext.Provider value={{
      currentTeam,
      setCurrentTeam,
      queue,
      updateQueue,
      isSupervisor,
      canManageTeam
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}