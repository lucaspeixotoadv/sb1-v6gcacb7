import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ChatbotState, ChatbotChannel, Chatbot, ChatbotFolder } from '../types';

interface ChatbotStore extends ChatbotState {
  setSelectedChannel: (channel?: ChatbotChannel) => void;
  setSelectedFolder: (folderId?: string) => void;
  setSearchTerm: (term: string) => void;
  createFolder: (name: string, parentId?: string) => void;
  updateFolder: (id: string, updates: Partial<ChatbotFolder>) => void;
  deleteFolder: (id: string) => void;
  createChatbot: (data: Partial<Chatbot>) => void;
  updateChatbot: (id: string, updates: Partial<Chatbot>) => void;
  deleteChatbot: (id: string) => void;
  duplicateChatbot: (id: string, targetFolderId?: string) => void;
  moveChatbot: (id: string, targetFolderId?: string) => void;
}

export const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set, get) => ({
      folders: {},
      chatbots: {},
      searchTerm: '',
      selectedChannel: undefined,
      selectedFolderId: undefined,

      setSelectedChannel: (channel) => set({ selectedChannel: channel }),
      setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),
      setSearchTerm: (term) => set({ searchTerm: term }),

      createFolder: (name, parentId) => {
        const { selectedChannel } = get();
        if (!selectedChannel) return;

        const id = uuidv4();
        const now = new Date();

        const newFolder: ChatbotFolder = {
          id,
          name,
          parentId,
          channelId: selectedChannel,
          subfolders: [],
          chatbots: [],
          createdAt: now,
          updatedAt: now
        };

        set(state => {
          // Update parent folder if exists
          if (parentId && state.folders[parentId]) {
            state.folders[parentId].subfolders.push(id);
          }

          return {
            folders: {
              ...state.folders,
              [id]: newFolder
            }
          };
        });
      },

      updateFolder: (id, updates) => {
        set(state => ({
          folders: {
            ...state.folders,
            [id]: {
              ...state.folders[id],
              ...updates,
              updatedAt: new Date()
            }
          }
        }));
      },

      deleteFolder: (id) => {
        set(state => {
          const folder = state.folders[id];
          if (!folder) return state;

          // Remove folder from parent's subfolders
          if (folder.parentId) {
            const parent = state.folders[folder.parentId];
            if (parent) {
              parent.subfolders = parent.subfolders.filter(fId => fId !== id);
            }
          }

          // Move chatbots to parent folder or root
          folder.chatbots.forEach(chatbotId => {
            const chatbot = state.chatbots[chatbotId];
            if (chatbot) {
              chatbot.folderId = folder.parentId;
            }
          });

          // Delete folder and all subfolders recursively
          const foldersToDelete = [id];
          const getAllSubfolders = (folderId: string) => {
            const f = state.folders[folderId];
            if (f) {
              f.subfolders.forEach(subId => {
                foldersToDelete.push(subId);
                getAllSubfolders(subId);
              });
            }
          };
          getAllSubfolders(id);

          const newFolders = { ...state.folders };
          foldersToDelete.forEach(fId => {
            delete newFolders[fId];
          });

          return { folders: newFolders };
        });
      },

      createChatbot: (data) => {
        const { selectedChannel, selectedFolderId } = get();
        if (!selectedChannel) return;
        
        const id = uuidv4();
        const now = new Date().toISOString();

        const newChatbot: Chatbot = {
          id,
          name: data.name || 'Novo Chatbot',
          channel: selectedChannel,
          folderId: selectedFolderId,
          status: 'draft',
          config: {},
          createdAt: now,
          updatedAt: now,
          ...data
        };

        set((state) => {
          // Add chatbot to folder if specified
          if (selectedFolderId && state.folders[selectedFolderId]) {
            return {
              chatbots: {
                ...state.chatbots,
                [id]: newChatbot
              },
              folders: {
                ...state.folders,
                [selectedFolderId]: {
                  ...state.folders[selectedFolderId],
                  chatbots: [...state.folders[selectedFolderId].chatbots, id]
                }
              }
            };
          }

          return {
            chatbots: {
              ...state.chatbots,
              [id]: newChatbot
            },
            folders: state.folders
          };
        });
      },

      updateChatbot: (id, updates) => {
        set(state => ({
          chatbots: {
            ...state.chatbots,
            [id]: {
              ...state.chatbots[id],
              ...updates,
              updatedAt: new Date().toISOString()
            }
          }
        }));
      },

      deleteChatbot: (id) => {
        set(state => {
          const chatbot = state.chatbots[id];
          const newState = {
            ...state,
            chatbots: { ...state.chatbots },
            folders: { ...state.folders }
          };
          
          if (!chatbot) return newState;

          // Remove chatbot from folder
          if (chatbot.folderId) {
            const folder = newState.folders[chatbot.folderId];
            if (folder) {
              const updatedChatbots = folder.chatbots.filter(cId => cId !== id);
              newState.folders = {
                ...newState.folders,
                [chatbot.folderId]: {
                  ...folder,
                  chatbots: updatedChatbots
                }
              };
            }
          }

          delete newState.chatbots[id];

          return newState;
        });
      },

      duplicateChatbot: (id, targetFolderId) => {
        const { chatbots, createChatbot } = get();
        const chatbot = chatbots[id];
        if (!chatbot) return;

        createChatbot({
          ...chatbot,
          name: `${chatbot.name} (Copy)`,
          folderId: targetFolderId
        });
      },

      moveChatbot: (id, targetFolderId) => set(state => {
        const chatbot = state.chatbots[id];
        const newState = { ...state };
        
        if (!chatbot) return newState;

        // Remove do folder atual
        if (chatbot.folderId) {
          const currentFolder = newState.folders[chatbot.folderId];
          if (currentFolder) {
            newState.folders = {
              ...newState.folders,
              [chatbot.folderId]: {
                ...currentFolder,
                chatbots: currentFolder.chatbots.filter(cId => cId !== id)
              }
            };
          }
        }

        // Adiciona ao novo folder
        if (targetFolderId) {
          const targetFolder = newState.folders[targetFolderId];
          if (targetFolder) {
            newState.folders = {
              ...newState.folders,
              [targetFolderId]: {
                ...targetFolder,
                chatbots: [...targetFolder.chatbots, id]
              }
            };
            newState.chatbots = {
              ...newState.chatbots,
              [id]: {
                ...chatbot,
                folderId: targetFolderId
              }
            };
          }
        } else {
          newState.chatbots = {
            ...newState.chatbots,
            [id]: {
              ...chatbot,
              folderId: undefined
            }
          };
        }

        return newState;
      }),
    }),
    {
      name: 'chatbot-storage',
      partialize: (state) => ({
        folders: state.folders,
        chatbots: state.chatbots
      })
    }
  )
);