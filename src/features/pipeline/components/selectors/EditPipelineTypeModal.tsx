import React from 'react';
import { X, Save } from 'lucide-react';
import type { PipelineTypeConfig } from '../../types';
import { AVAILABLE_ICONS } from '../../constants/icons';
import { AVAILABLE_COLORS } from '../../constants/colors';

interface EditPipelineTypeModalProps {
  isOpen: boolean;
  config: PipelineTypeConfig;
  onClose: () => void;
  onSave: (config: PipelineTypeConfig) => void;
}

export function EditPipelineTypeModal({ isOpen, config, onClose, onSave }: EditPipelineTypeModalProps) {
  const [editedConfig, setEditedConfig] = React.useState(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">Editar Tipo de Pipeline</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSave(editedConfig);
          }} 
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={editedConfig.name}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={editedConfig.description}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((IconComponent, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setEditedConfig(prev => ({ ...prev, icon: IconComponent }))}
                  className={`p-2 rounded-lg border ${
                    editedConfig.icon === IconComponent ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={20} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setEditedConfig(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full ${color} ${
                    editedConfig.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}