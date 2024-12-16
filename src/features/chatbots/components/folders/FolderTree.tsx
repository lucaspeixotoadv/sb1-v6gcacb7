import React from 'react';
import { Folder, ChevronRight, ChevronDown, MoreVertical, Plus } from 'lucide-react';
import { useChatbotStore } from '../store/chatbotStore';
import { ChatbotItem } from './ChatbotItem';

export function FolderTree() {
  const {
    selectedChannel,
    selectedFolderId,
    folders,
    chatbots,
    searchTerm,
    setSelectedFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    moveChatbot
  } = useChatbotStore();

  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = React.useState<{ id: string; type: 'chatbot' | 'folder' } | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [editingFolder, setEditingFolder] = React.useState<string | null>(null);
  const [newFolderName, setNewFolderName] = React.useState('');

  const rootFolders = React.useMemo(() => {
    if (!selectedChannel) return [];
    return Object.values(folders).filter(
      folder => folder.channelId === selectedChannel && !folder.parentId
    );
  }, [folders, selectedChannel]);

  const rootChatbots = React.useMemo(() => {
    if (!selectedChannel) return [];
    return Object.values(chatbots).filter(
      chatbot => chatbot.channel === selectedChannel && !chatbot.folderId
    );
  }, [chatbots, selectedChannel]);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'chatbot' | 'folder') => {
    setDraggedItem({ id, type });
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== folderId) {
      setDropTarget(folderId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === 'chatbot') {
      moveChatbot(draggedItem.id, targetFolderId);
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const renderFolder = (folder: typeof folders[keyof typeof folders]) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isEditing = editingFolder === folder.id;
    const isDropTarget = dropTarget === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`
            flex items-center gap-2 p-2 rounded-lg cursor-pointer
            ${selectedFolderId === folder.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
            ${isDropTarget ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
          `}
          onClick={() => setSelectedFolder(folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDrop={(e) => handleDrop(e, folder.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, folder.id, 'folder')}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedFolders(prev => {
                const next = new Set(prev);
                if (next.has(folder.id)) {
                  next.delete(folder.id);
                } else {
                  next.add(folder.id);
                }
                return next;
              });
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <Folder size={16} className="text-gray-400" />

          {isEditing ? (
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFolder(folder.id, { name: newFolderName });
                  setEditingFolder(null);
                }
                if (e.key === 'Escape') {
                  setEditingFolder(null);
                }
              }}
              onBlur={() => setEditingFolder(null)}
              className="flex-1 bg-transparent border-none focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="flex-1">{folder.name}</span>
          )}

          <div className="opacity-0 group-hover:opacity-100 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(folder.id);
                setNewFolderName(folder.name);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {folder.subfolders.map(subfolderId => {
              const subfolder = folders[subfolderId];
              if (subfolder) {
                return renderFolder(subfolder);
              }
              return null;
            })}

            {folder.chatbots.map(chatbotId => {
              const chatbot = chatbots[chatbotId];
              if (chatbot) {
                return (
                  <ChatbotItem
                    key={chatbot.id}
                    chatbot={chatbot}
                    onDragStart={(e) => handleDragStart(e, chatbot.id, 'chatbot')}
                  />
                );
              }
              return null;
            })}

            <button
              onClick={() => createFolder('Nova Pasta', folder.id)}
              className="flex items-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Plus size={16} />
              Nova Pasta
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {rootFolders.map(renderFolder)}
      
      {rootChatbots.map(chatbot => (
        <ChatbotItem
          key={chatbot.id}
          chatbot={chatbot}
          onDragStart={(e) => handleDragStart(e, chatbot.id, 'chatbot')}
        />
      ))}

      <button
        onClick={() => createFolder('Nova Pasta')}
        className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
      >
        <Plus size={16} />
        Nova Pasta
      </button>
    </div>
  );
}