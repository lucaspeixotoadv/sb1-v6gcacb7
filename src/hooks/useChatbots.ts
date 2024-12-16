import { useState, useCallback } from 'react';
import type { Chatbot, ChatbotPayload } from '../types';

export function useChatbots(initialChatbots: Chatbot[] = []) {
  const [chatbots, setChatbots] = useState<Chatbot[]>(initialChatbots);

  const addChatbot = useCallback((payload: ChatbotPayload) => {
    const newChatbot: Chatbot = {
      id: `chatbot-${Date.now()}`,
      name: payload.name,
      description: payload.description,
      channel: payload.channel,
      group: payload.group,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setChatbots(prev => [...prev, newChatbot]);
    return newChatbot;
  }, []);

  const updateChatbot = useCallback((id: string, updates: Partial<ChatbotPayload>) => {
    setChatbots(prev => prev.map(chatbot => {
      if (chatbot.id === id) {
        return {
          ...chatbot,
          ...updates,
          updatedAt: new Date()
        };
      }
      return chatbot;
    }));
  }, []);

  const deleteChatbot = useCallback((id: string) => {
    setChatbots(prev => prev.filter(chatbot => chatbot.id !== id));
  }, []);

  const reorderChatbots = useCallback((sourceIndex: number, destinationIndex: number) => {
    setChatbots(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    });
  }, []);

  const updateChatbotStatus = useCallback((id: string, status: Chatbot['status']) => {
    setChatbots(prev => prev.map(chatbot => {
      if (chatbot.id === id) {
        return {
          ...chatbot,
          status,
          updatedAt: new Date()
        };
      }
      return chatbot;
    }));
  }, []);

  return {
    chatbots,
    addChatbot,
    updateChatbot,
    deleteChatbot,
    reorderChatbots,
    updateChatbotStatus
  };
}