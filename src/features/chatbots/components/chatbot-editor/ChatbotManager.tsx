import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useChatbotStore } from '../../store/chatbotStore';
import { FolderView } from '../../components/folders/FolderView';
import { ChatbotEditor } from './ChatbotEditor';
import type { ChatbotChannel } from '../../types';

const CHANNEL_NAMES: Record<ChatbotChannel, string> = {
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
  telegram: 'Telegram'
};

export function ChatbotManager() {
  const {
    selectedChannel,
    selectedFolderId,
    setSelectedChannel, 
    setSelectedFolder
  } = useChatbotStore();
  const [selectedChatbotId, setSelectedChatbotId] = React.useState<string | null>(null);

  if (!selectedChannel) return null;

  // Show chatbot editor when a chatbot is selected
  if (selectedChatbotId) {
    return (
      <ChatbotEditor
        chatbotId={selectedChatbotId}
        onBack={() => setSelectedChatbotId(null)}
      />
    );
  }

  return (
    <FolderView
      folderId={selectedFolderId}
      onSelectFolder={setSelectedFolder}
      onSelectChatbot={setSelectedChatbotId}
      onBack={() => selectedFolderId ? setSelectedFolder(undefined) : setSelectedChannel(undefined)}
    />
  );
}