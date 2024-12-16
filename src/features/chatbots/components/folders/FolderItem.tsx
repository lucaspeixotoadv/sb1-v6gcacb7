// src/features/chatbots/components/FolderItem.tsx

import React from 'react';
import { ChevronRight, FolderIcon } from 'lucide-react';
import type { ChatbotFolder } from '../types';

interface FolderItemProps {
  folder: ChatbotFolder;
  onSelectFolder: (id: string) => void;
}

export const FolderItem: React.FC<FolderItemProps> = ({ folder, onSelectFolder }) => (
  <button
    onClick={() => onSelectFolder(folder.id)}
    className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:border-blue-500 hover:shadow-md transition-all group text-left"
    aria-label={`Abrir pasta ${folder.name}`}
  >
    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
      <FolderIcon size={24} className="text-blue-600" />
    </div>
    
    <div className="flex-1 text-left">
      <h3 className="font-medium flex items-center gap-2">
        {folder.name}
        <ChevronRight size={16} className="text-gray-400 transition-transform group-hover:translate-x-1" />
      </h3>
      <p className="text-sm text-gray-500">
        {folder.chatbots.length} chatbot{folder.chatbots.length !== 1 ? 's' : ''}
      </p>
    </div>
  </button>
);
