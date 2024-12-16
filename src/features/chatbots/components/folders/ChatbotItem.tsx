import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, GripVertical } from 'lucide-react';
import type { Chatbot } from '../types';

interface ChatbotItemProps {
  chatbot: Chatbot;
  onSelectChatbot: (id: string) => void;
  onEditChatbot: (id: string) => void;
  onDeleteChatbot: (id: string, name: string) => void;
  onDragStart: () => void;
  isDragging?: boolean;
}

export function ChatbotItem({
  chatbot,
  onSelectChatbot,
  onEditChatbot,
  onDeleteChatbot,
  onDragStart,
  isDragging
}: ChatbotItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(chatbot.name);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart();
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editedName.trim() && editedName !== chatbot.name) {
      onEditChatbot(chatbot.id);
      updateChatbot(chatbot.id, { name: editedName.trim() });
      setIsEditing(false);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique propague para o card
    setShowMenu(!showMenu);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditChatbot(chatbot.id);
    setShowMenu(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChatbot(chatbot.id, chatbot.name);
    setShowMenu(false);
  };

  return (
    <div
      className={`
        relative flex items-center gap-4 p-4 bg-white rounded-xl border
        hover:border-blue-500 hover:shadow-md transition-all cursor-pointer
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-50' : ''}
      `}
      onClick={() => !isEditing && onSelectChatbot(chatbot.id)}
      draggable
      onDragStart={handleDragStart}
    >
      {/* Drag Handle */}
      <div className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>

      {/* Chatbot Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
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
                    setEditedName(chatbot.name);
                  }
                }}
              />
            </form>
          ) : (
            <h3 
              className="font-medium truncate cursor-text" 
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {chatbot.name}
            </h3>
          )}
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={16} />
            </button>

            {/* Menu de Ações */}
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                <button
                  onClick={handleEditClick}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 size={14} />
                  Editar Fluxo
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Excluir Fluxo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-2 flex items-center gap-2">
          <span className={`
            text-xs px-2 py-0.5 rounded-full
            ${chatbot.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : chatbot.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
            }
          `}>
            {chatbot.status === 'active' ? 'Ativo' 
              : chatbot.status === 'draft' ? 'Rascunho' 
              : 'Inativo'}
          </span>
          <span className="text-xs text-gray-500">
            Atualizado em {new Date(chatbot.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}