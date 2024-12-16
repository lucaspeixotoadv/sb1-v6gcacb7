import { useState, useCallback } from 'react';
import type { Message } from '../../../types';
import type { UseMessagesReturn } from '../types';

const mockMessages: Message[] = [];

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const sendMessage = useCallback((contactId: string, content: string, type: Message['type'] = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      contactId,
      content,
      type,
      direction: 'outgoing',
      status: 'sent',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const markMessageAsDelivered = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, status: 'delivered' as const }
          : msg
      )
    );
  }, []);

  const markMessageAsRead = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, status: 'read' as const }
          : msg
      )
    );
  }, []);

  const filteredMessages = useCallback((contactId: string) => {
    return messages.filter(msg => msg.contactId === contactId);
  }, [messages]);

  return {
    messages,
    filteredMessages,
    sendMessage,
    markMessageAsDelivered,
    markMessageAsRead,
  };
}