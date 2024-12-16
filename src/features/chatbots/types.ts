export type ChatbotChannel = 'whatsapp' | 'messenger' | 'instagram' | 'telegram';

export interface ChatbotFolder {
  id: string;
  name: string;
  parentId?: string;
  channelId: ChatbotChannel;
  subfolders: string[];
  chatbots: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  channel: ChatbotChannel;
  folderId?: string;
  status: 'active' | 'inactive' | 'draft';
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotState {
  folders: Record<string, ChatbotFolder>;
  chatbots: Record<string, Chatbot>;
  selectedChannel?: ChatbotChannel;
  selectedFolderId?: string;
  searchTerm: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'channel' | 'folder';
}

export interface FlowConfig {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    markerEnd?: { type: string };
  }>;
}

export interface ChatbotConfig {
  id: string;
  name: string;
  description?: string;
  channel: ChatbotChannel;
  status: 'active' | 'inactive' | 'draft';
  flow?: FlowConfig;
  createdAt: Date;
  updatedAt: Date;
}