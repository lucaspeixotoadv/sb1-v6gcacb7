import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Chatbot, ChatbotPayload } from '../types';

interface ChatbotState {
  chatbots: Chatbot[];
  activeChatbotId: string | null;
  addChatbot: (data: ChatbotPayload) => Chatbot;
  updateChatbot: (id: string, data: Partial<Chatbot>) => void;
  deleteChatbot: (id: string) => void;
  toggleChatbotStatus: (id: string) => void;
  setActiveChatbotId: (id: string | null) => void;
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      chatbots: [],
      activeChatbotId: null,

      addChatbot: (data) => {
        const chatbot: Chatbot = {
          id: uuidv4(),
          name: data.name,
          description: data.description,
          channel: data.channel,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set((state) => ({
          chatbots: [...state.chatbots, chatbot],
          activeChatbotId: chatbot.id
        }));

        return chatbot;
      },

      updateChatbot: (id, data) => {
        set((state) => ({
          chatbots: state.chatbots.map((chatbot) =>
            chatbot.id === id
              ? { ...chatbot, ...data, updatedAt: new Date() }
              : chatbot
          )
        }));
      },

      deleteChatbot: (id) => {
        set((state) => ({
          chatbots: state.chatbots.filter((chatbot) => chatbot.id !== id),
          activeChatbotId: state.activeChatbotId === id ? null : state.activeChatbotId
        }));
      },

      toggleChatbotStatus: (id) => {
        set((state) => ({
          chatbots: state.chatbots.map((chatbot) =>
            chatbot.id === id
              ? {
                  ...chatbot,
                  status: chatbot.status === 'active' ? 'inactive' : 'active',
                  updatedAt: new Date()
                }
              : chatbot
          )
        }));
      },

      setActiveChatbotId: (id) => set({ activeChatbotId: id })
    }),
    {
      name: 'chatbot-storage',
      partialize: (state) => ({
        chatbots: state.chatbots,
        activeChatbotId: state.activeChatbotId
      })
    }
  )
);