import React, { useState } from "react";
import { Plus, GitBranch } from "lucide-react";
import { useChatbotStore } from "../../store/chatbotStore";
import { ChatbotItem } from "./ChatbotItem";
import { ChatbotFolderItem } from "./ChatbotFolderItem";

export interface FolderViewProps {
  folderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
  onSelectChatbot: (chatbotId: string) => void;
  onBack: () => void;
}

export function FolderView({
  folderId,
  onSelectFolder,
  onSelectChatbot,
  onBack
}: FolderViewProps) {
  const { folders, chatbots, updateChatbot, deleteChatbot } = useChatbotStore();
  const folder = folders[folderId || ''];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBack = () => {
    if (folderId) {
      onBack();
      onSelectFolder(undefined);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditChatbot = (id: string) => {
    // Implemente a lógica de edição aqui
    console.log('Editando chatbot:', id);
  };

  const handleDeleteChatbot = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o chatbot "${name}"?`)) {
      deleteChatbot(id);
    }
  };

  const handleDragStart = () => {
    // Implemente a lógica de drag start aqui
    console.log('Iniciando drag');
  };

  const currentFolder = folders[folderId || ''] || {};
  const folderChatbots = Object.values(chatbots).filter(
    chatbot => chatbot.folderId === folderId
  );
  const subFolders = Object.values(folders).filter(
    f => f.parentId === folderId
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {folderId && (
            <button
              onClick={handleBack}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Voltar
            </button>
          )}
          <h2 className="text-lg font-medium">
            {folder?.name || 'Chatbots'}
          </h2>
        </div>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid gap-4">
        {subFolders.map(folder => (
          <ChatbotFolderItem
            key={folder.id}
            folder={folder}
            onSelect={() => onSelectFolder(folder.id)}
          />
        ))}

        {folderChatbots.map(chatbot => (
          <ChatbotItem
            key={chatbot.id}
            chatbot={chatbot}
            onSelectChatbot={onSelectChatbot}
            onEditChatbot={handleEditChatbot}
            onDeleteChatbot={handleDeleteChatbot}
            onDragStart={handleDragStart}
          />
        ))}

        {!subFolders.length && !folderChatbots.length && (
          <div className="text-center py-8 text-gray-500">
            <GitBranch className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>Nenhum chatbot ou pasta encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}