import React, { useState } from 'react';
import { ChevronRight, FolderIcon } from 'lucide-react';
import { useChatbotStore } from '../../store/chatbotStore';
import type { ChatbotFolder } from '../../types';

interface ChatbotFolderItemProps {
  folder: ChatbotFolder;
  onSelectFolder: (id: string) => void;
}

export function ChatbotFolderItem({ folder, onSelectFolder }: ChatbotFolderItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(folder.name);
  const { updateFolder } = useChatbotStore();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editedName.trim() && editedName !== folder.name) {
      updateFolder(folder.id, { name: editedName.trim() });
      setIsEditing(false);
    }
  };

  return (
    <button
      onClick={() => onSelectFolder(folder.id)}
      className={`
        flex items-center gap-4 p-4 bg-white rounded-xl border 
        ${!isEditing ? 'hover:border-blue-500 hover:shadow-md' : ''} 
        transition-all group text-left
      `}
      aria-label={`Abrir pasta ${folder.name}`}
    >
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
        <FolderIcon size={24} className="text-blue-600" />
      </div>
      
      <div className="flex-1 text-left">
        {isEditing ? (
          <form onSubmit={handleNameSubmit} onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onBlur={handleNameSubmit}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditedName(folder.name);
                }
              }}
            />
          </form>
        ) : (
          <div>
            <h3 
              className="font-medium flex items-center gap-2 cursor-text" 
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {folder.name}
              <ChevronRight size={16} className="text-gray-400 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="text-sm text-gray-500">
              {folder.chatbots.length} chatbot{folder.chatbots.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}