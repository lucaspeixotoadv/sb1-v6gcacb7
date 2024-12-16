export interface ChatAssignment {
  id: string;
  chatId: string;
  userId: string;
  teamId: string;
  status: 'pending' | 'active' | 'resolved' | 'transferred';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedAt: Date;
  resolvedAt?: Date;
  transferredTo?: {
    userId?: string;
    teamId?: string;
    reason: string;
  };
}

export interface ChatQueue {
  id: string;
  teamId: string;
  items: QueueItem[];
  settings: QueueSettings;
  stats: QueueStats;
}

export interface QueueItem {
  id: string;
  chatId: string;
  contactId: string;
  priority: number;
  enteredAt: Date;
  tags: string[];
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
}

export interface QueueSettings {
  maxSize: number;
  priorityRules: PriorityRule[];
  autoAssignmentEnabled: boolean;
  assignmentStrategy: AssignmentStrategy;
}

export interface PriorityRule {
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith';
    value: string;
  };
  priority: number;
}

export type AssignmentStrategy = {
  type: 'round-robin' | 'least-busy' | 'random';
  config?: {
    maxChatsPerAgent?: number;
    considerAgentLoad?: boolean;
  };
}