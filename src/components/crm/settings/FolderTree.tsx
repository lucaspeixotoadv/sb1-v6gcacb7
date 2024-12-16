import React from 'react';
import { Folder, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import type { Folder as FolderType } from '../../../features/settings/types';

interface TreeItem {
  id: string;
  label: string;
}

interface FolderTreeProps {
  folders: FolderType[];
  items: TreeItem[];
  onMoveItem: (itemId: string, folderId?: string) => void;
  onAddFolder: (name: string, parentId?: string) => void;
  onRemoveFolder: (folderId: string) => void;
}

interface DragItem {
  id: string;
  type: 'item' | 'folder';
}

export function FolderTree({ folders, items, onMoveItem, onAddFolder, onRemoveFolder }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = React.useState<DragItem | null>(null);
  const [dragOverFolder, setDragOverFolder] = React.useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (folderId !== dragOverFolder) {
      setDragOverFolder(folderId || null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as DragItem;
      if (data.type === 'item') {
        onMoveItem(data.id, folderId);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }

    setDragOverFolder(null);
    setDraggedItem(null);
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const unorganizedItems = items?.filter(
    item => !folders.some(folder => folder.items.includes(item.id))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Pastas</h4>
        <button
          onClick={() => !isAddingFolder && setIsAddingFolder(true)}
          className="text-sm text-black hover:text-gray-800"
        >
          + Nova Pasta
        </button>
      </div>

      {isAddingFolder && (
        <form onSubmit={handleAddFolder} className="flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nome da pasta..."
            className="flex-1 px-2 py-1 text-sm border rounded"
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800"
          >
            Adicionar
          </button>
        </form>
      )}

      <div className="space-y-2">
        {folders.map(folder => (
          <div key={folder.id} className="space-y-1">
            <div
              className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer ${
                expandedFolders.has(folder.id) ? 'bg-gray-50' : ''} ${
                dragOverFolder === folder.id ? 'border-2 border-black bg-gray-50' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder.id)}
            >
              <button className="text-gray-400">
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <Folder size={16} className={`text-gray-400 ${dragOverFolder === folder.id ? 'text-blue-500' : ''}`} />
              <span className="text-sm">{folder.name}</span>
            </div>

            {expandedFolders.has(folder.id) && (
              <div className="ml-8 space-y-1">
                {folder.items.map(itemId => {
                  const item = items.find(i => i.id === itemId);
                  if (!item) return null;

                  return (
                    <div
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, { id: item.id, type: 'item' })}
                      onDragEnd={() => {
                        setDraggedItem(null);
                        setDragOverFolder(null);
                      }}
                      className={`flex items-center gap-2 p-1 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-move ${
                        draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div
          className="p-2 border-t mt-2"
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e)}
        >
          <div className="text-sm text-gray-500 mb-2">Não organizados</div>
          {unorganizedItems.map(item => (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, { id: item.id, type: 'item' })}
              onDragEnd={() => {
                setDraggedItem(null);
                setDragOverFolder(null);
              }}
              className={`flex items-center gap-2 p-1 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-move ${
                draggedItem?.id === item.id ? 'opacity-50' : ''}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}