import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { AVAILABLE_ICONS } from '../../constants/icons';
import { AVAILABLE_COLORS } from '../../constants/colors';
import type { PipelineTypeConfig } from '../../types';

interface CreatePipelineCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: PipelineTypeConfig) => void;
}

export function CreatePipelineCategoryModal({ isOpen, onClose, onSubmit }: CreatePipelineCategoryModalProps) {
  const [formData, setFormData] = useState<Omit<PipelineTypeConfig, 'id'>>({
    name: '',
    description: '',
    icon: AVAILABLE_ICONS[0],
    color: AVAILABLE_COLORS[0],
    isEditable: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      ...formData,
      id: `custom-${Date.now()}`
    });
    
    setFormData({
      name: '',
      description: '',
      icon: AVAILABLE_ICONS[0],
      color: AVAILABLE_COLORS[0],
      isEditable: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium">Nova Categoria de Pipeline</h3>
            <p className="text-sm text-gray-500 mt-1">
              Crie uma nova categoria para organizar seus pipelines personalizados
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Pipeline de Marketing"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Descreva o propósito desta categoria de pipeline..."
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
                  onClick={() => setFormData(prev => ({ ...prev, icon: IconComponent }))}
                  className={`p-2 rounded-lg border ${
                    formData.icon === IconComponent ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={20} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor da Categoria
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full ${color} ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}