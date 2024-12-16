import type { Message as BaseMessage } from '../../types';

export interface MessageActions {
  sendMessage: (contactId: string, content: string, type: BaseMessage['type']) => void;
  markMessageAsDelivered: (messageId: string) => void;
  markMessageAsRead: (messageId: string) => void;
}

export interface UseMessagesReturn extends MessageActions {
  messages: BaseMessage[];
  filteredMessages: (contactId: string) => BaseMessage[];
}