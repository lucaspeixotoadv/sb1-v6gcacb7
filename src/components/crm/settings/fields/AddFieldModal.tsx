import React, { useState } from 'react';
import { X as XIcon } from 'lucide-react';
import type { CustomFieldDefinition } from '../../../../features/settings/types';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (field: CustomFieldDefinition) => void;
  initialField: CustomFieldDefinition;
}

export function AddFieldModal({ isOpen, onClose, onSubmit, initialField }: AddFieldModalProps) {
  const [field, setField] = useState(initialField);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (field.key && field.label) {
      onSubmit(field);
      setField({ key: '', label: '', type: 'text' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Novo Campo Personalizado</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chave do Campo
            </label>
            <input
              type="text"
              value={field.key}
              onChange={(e) => setField(prev => ({ ...prev, key: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Campo
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => setField(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo do Campo
            </label>
            <select
              value={field.type}
              onChange={(e) => setField(prev => ({ ...prev, type: e.target.value as CustomFieldDefinition['type'] }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="currency">Moeda</option>
              <option value="date">Data</option>
              <option value="datetime">Data e Hora</option>
            </select>
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
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Adicionar Campo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}