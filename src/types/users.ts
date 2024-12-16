export type UserRole = 'admin' | 'supervisor' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  photoUrl?: string;
  teamId?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
  settings: UserSettings;
  stats: UserStats;
}

export type UserStatus = 'available' | 'busy' | 'away' | 'offline';

export interface UserSettings {
  notifications: {
    email: boolean;
    desktop: boolean;
    sound: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoAcceptChats: boolean;
  maxSimultaneousChats: number;
}

export interface UserStats {
  totalMessages: number;
  averageResponseTime: number; // in seconds
  resolvedChats: number;
  activeChats: number;
  satisfaction: number; // 0-5 rating
  lastDayStats: {
    messages: number;
    chats: number;
    avgResponseTime: number;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  supervisorId: string;
  members: string[]; // user IDs
  settings: TeamSettings;
  stats: TeamStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSettings {
  autoAssignment: boolean;
  assignmentStrategy: 'round-robin' | 'least-busy' | 'random';
  workingHours: {
    start: string; // HH:mm format
    end: string;
    timezone: string;
    days: number[]; // 0-6, where 0 is Sunday
  };
  maxQueueSize: number;
  priorityTags: string[];
}

export interface TeamStats {
  activeChats: number;
  queueSize: number;
  averageWaitTime: number;
  averageHandleTime: number;
  totalMessagesToday: number;
  satisfaction: number;
  onlineAgents: number;
}