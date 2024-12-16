import React, { useState } from 'react';
import { Plus, X as XIcon, Trash2 } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import { FolderTree } from './FolderTree';
import { AddFieldModal } from './fields/AddFieldModal';
import { CustomFieldCard } from './fields/CustomFieldCard';
import type { CustomFieldDefinition } from '../../../features/settings/types';

export function CustomFieldsManager() {
  const { 
    settings, 
    addCustomField, 
    removeCustomField, 
    updateCustomField,
    addFolder,
    removeFolder,
    moveItemToFolder 
  } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newField, setNewField] = useState<CustomFieldDefinition>({
    key: '',
    label: '',
    type: 'text'
  });

  const handleAddField = (field: CustomFieldDefinition) => {
    addCustomField(field);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Campos Personalizados</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Campo
        </button>
      </div>

      <FolderTree
        folders={settings.folders.fields}
        items={settings.customFieldDefinitions.map(field => ({
          id: field.key,
          label: field.label
        })) || []}
        onMoveItem={(itemId, folderId) => {
          moveItemToFolder('fields', itemId, folderId);
        }}
        onAddFolder={(name) => addFolder('fields', name)}
        onRemoveFolder={(id) => removeFolder('fields', id)}
      />

      {/* Lista de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.customFieldDefinitions.map((field) => (
          <div
            key={field.key}
            className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{field.label}</h4>
                <p className="text-sm text-gray-500">Chave: {field.key}</p>
                <p className="text-sm text-gray-500">Tipo: {field.type}</p>
              </div>
              <button
                onClick={() => removeCustomField(field.key)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Adição de Campo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Novo Campo Personalizado</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddField} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave do Campo
                </label>
                <input
                  type="text"
                  value={newField.key}
                  onChange={(e) => setNewField(prev => ({ ...prev, key: e.target.value }))}
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
                  value={newField.label}
                  onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo do Campo
                </label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as CustomFieldDefinition['type'] }))}
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
                  onClick={() => setShowAddModal(false)}
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
      )}
    </div>
  );
}