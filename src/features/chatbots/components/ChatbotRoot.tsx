import React from 'react';
import { ChannelGrid } from './list/ChannelGrid';
import { ChatbotManager } from './chatbot-editor/ChatbotManager';
import { useChatbotStore } from '../store/chatbotStore';

export function ChatbotRoot() {
  const { selectedChannel, setSelectedChannel } = useChatbotStore();

  return selectedChannel ? (
    <ChatbotManager />
  ) : (
    <ChannelGrid onSelectChannel={setSelectedChannel} />
  );
}