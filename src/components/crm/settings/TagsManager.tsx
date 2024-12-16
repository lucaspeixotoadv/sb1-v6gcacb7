import React from 'react';
import { Plus, X } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import type { Settings } from '../../../features/settings/types';

interface TagsManagerProps {
  settings: Settings;
}

export function TagsManager({ settings }: TagsManagerProps) {
  const { addTag, removeTag } = useSettings();
  const [newTag, setNewTag] = React.useState('');
  const [localTags, setLocalTags] = React.useState(settings.availableTags);

  // Sincroniza o estado local quando as settings mudam
  React.useEffect(() => {
    setLocalTags(settings.availableTags);
  }, [settings.availableTags]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && !localTags.includes(trimmedTag)) {
      try {
        await addTag(trimmedTag);
        // Atualiza o estado local imediatamente
        setLocalTags(prev => [...prev, trimmedTag]);
        setNewTag('');
      } catch (error) {
        console.error('Erro ao adicionar etiqueta:', error);
      }
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(tag);
      // Atualiza o estado local imediatamente
      setLocalTags(prev => prev.filter(t => t !== tag));
    } catch (error) {
      console.error('Erro ao remover etiqueta:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gerenciar Etiquetas</h3>
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nova etiqueta..."
            className="px-3 py-2 border rounded-lg"
            aria-label="Nova etiqueta"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
            aria-label="Adicionar etiqueta"
          >
            <Plus size={20} />
            Adicionar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {localTags.map((tag) => (
          <div
            key={tag}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span>{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-gray-400 hover:text-gray-600"
              aria-label={`Remover etiqueta ${tag}`}
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}