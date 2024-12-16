import { useState, useCallback } from 'react';
import type { ChatQueue, QueueItem, ChatAssignment } from '../types/chat';
import type { User } from '../types/users';

export function useQueue(initialQueue?: ChatQueue) {
  const [queue, setQueue] = useState<ChatQueue>(initialQueue || {
    id: `queue-${Date.now()}`,
    teamId: '',
    items: [],
    settings: {
      maxSize: 100,
      priorityRules: [],
      autoAssignmentEnabled: true,
      assignmentStrategy: {
        type: 'round-robin',
        config: {
          maxChatsPerAgent: 5,
          considerAgentLoad: true
        }
      }
    },
    stats: {
      totalItems: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      assignedItems: 0
    }
  });

  const [assignments, setAssignments] = useState<ChatAssignment[]>([]);

  const addToQueue = useCallback((item: Omit<QueueItem, 'id' | 'enteredAt'>) => {
    const newItem: QueueItem = {
      id: `queue-item-${Date.now()}`,
      enteredAt: new Date(),
      ...item
    };

    setQueue(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    return newItem;
  }, []);

  const removeFromQueue = useCallback((itemId: string) => {
    setQueue(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  }, []);

  const assignChat = useCallback((item: QueueItem, user: User) => {
    const assignment: ChatAssignment = {
      id: `assignment-${Date.now()}`,
      chatId: item.chatId,
      userId: user.id,
      teamId: queue.teamId,
      status: 'active',
      priority: 'normal',
      assignedAt: new Date()
    };

    setAssignments(prev => [...prev, assignment]);
    removeFromQueue(item.id);

    return assignment;
  }, [queue.teamId, removeFromQueue]);

  const autoAssign = useCallback((availableAgents: User[]) => {
    if (!queue.settings.autoAssignmentEnabled || queue.items.length === 0 || availableAgents.length === 0) {
      return;
    }

    const { type, config } = queue.settings.assignmentStrategy;

    switch (type) {
      case 'round-robin': {
        const item = queue.items[0];
        const agent = availableAgents[0]; // Implement proper round-robin logic
        return assignChat(item, agent);
      }
      case 'least-busy': {
        // Implement least busy logic
        break;
      }
      case 'random': {
        const item = queue.items[0];
        const randomIndex = Math.floor(Math.random() * availableAgents.length);
        const agent = availableAgents[randomIndex];
        return assignChat(item, agent);
      }
    }
  }, [queue, assignChat]);

  const updateQueueSettings = useCallback((settings: Partial<ChatQueue['settings']>) => {
    setQueue(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
  }, []);

  return {
    queue,
    assignments,
    addToQueue,
    removeFromQueue,
    assignChat,
    autoAssign,
    updateQueueSettings
  };
}