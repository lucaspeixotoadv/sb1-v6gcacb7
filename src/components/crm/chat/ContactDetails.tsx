import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import type { Contact } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const STORAGE_KEY = 'contactDetailsExpanded';

interface ContactDetailsProps {
  contact: Contact;
  onUpdateContact: (updates: Partial<Contact>) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onAddCustomField: (key: string, value: string) => void;
  onRemoveCustomField: (key: string) => void;
}

interface AddFieldModalProps {
  isOpen: boolean;
  availableOptions: { key: string; label: string }[];
  onClose: () => void;
  onAdd: (key: string, value: string) => void;
  type: 'tag' | 'field';
}

function AddFieldModal({ isOpen, availableOptions, onClose, onAdd, type }: AddFieldModalProps) {
  const [selectedKey, setSelectedKey] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'tag') {
      onAdd(selectedKey, '');
    } else {
      onAdd(selectedKey, value);
    }
    setSelectedKey('');
    setValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Adicionar {type === 'tag' ? 'Etiqueta' : 'Campo'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'tag' ? 'Selecione a Etiqueta' : 'Selecione o Campo'}
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
              required
            >
              <option value="">Selecione...</option>
              {availableOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {type === 'field' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}

export function ContactDetails({
  contact,
  onUpdateContact,
  onAddTag,
  onRemoveTag,
  onAddCustomField,
  onRemoveCustomField
}: ContactDetailsProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useLocalStorage(STORAGE_KEY, true);
  const { settings } = useSettings();

  const handleKeyPress = React.useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'i') {
      setIsExpanded(prev => !prev);
    }
  }, [setIsExpanded]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const availableTags = settings.availableTags
    .filter(tag => !contact.tags.includes(tag))
    .map(tag => ({ key: tag, label: tag }));

  const availableFields = settings.customFieldDefinitions
    .filter(field => !(field.key in contact.customFields))
    .map(field => ({ key: field.key, label: field.label }));

  const handleAddTag = (tag: string) => {
    onAddTag(tag);
    setIsTagModalOpen(false);
  };

  const handleAddField = (key: string, value: string) => {
    onAddCustomField(key, value);
    setIsFieldModalOpen(false);
  };

  return (
    <div className={`bg-white border-l transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-20'
    }`}>
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title={isExpanded ? 'Minimizar' : 'Expandir'}
        >
          {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        {isExpanded && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Editar"
          >
            <Edit2 size={20} />
          </button>
        )}
      </div>

      <div className={`text-center ${isExpanded ? 'p-4' : 'p-2'} mb-2`}>
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
        {isExpanded ? (
          <div className="space-y-2">
            {isEditing ? (
              <input
                type="text"
                value={contact.name}
                onChange={(e) => onUpdateContact({ name: e.target.value })}
                className="w-full text-center font-medium p-1 border rounded"
              />
            ) : (
              <h3 className="font-medium">{contact.name}</h3>
            )}
            {isEditing ? (
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => onUpdateContact({ phone: e.target.value })}
                className="w-full text-center text-sm text-gray-500 p-1 border rounded"
              />
            ) : (
              <p className="text-sm text-gray-500">{contact.phone}</p>
            )}
            {isEditing && contact.email !== undefined && (
              <input
                type="email"
                value={contact.email || ''}
                onChange={(e) => onUpdateContact({ email: e.target.value })}
                className="w-full text-center text-sm text-gray-500 p-1 border rounded"
                placeholder="Email"
              />
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 truncate" title={contact.name}>
            {contact.name}
          </div>
        )}
      </div>
      
      {isExpanded && <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500">Etiquetas</h4>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {contact.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center gap-1"
              >
                {tag}
                {isEditing && (
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="text-blue-800 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500">Notas</h4>
          </div>
          <div className="relative">
            <textarea
              value={contact.notes || ''}
              onChange={(e) => onUpdateContact({ notes: e.target.value })}
              className="w-full p-2 border rounded-lg text-sm"
              rows={4}
              placeholder="Adicionar nota..."
              disabled={!isEditing}
            />
            {!isEditing && (
              <div className="absolute inset-0 bg-gray-50 bg-opacity-50 cursor-not-allowed" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500">Campos Personalizados</h4>
            <button
              onClick={() => setIsFieldModalOpen(true)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(contact.customFields).map(([key, value]) => (
              <div key={key} className="flex flex-col p-2 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">{key}</span>
                    <span className="text-sm block">{value}</span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => onRemoveCustomField(key)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      <AddFieldModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        availableOptions={availableTags}
        onAdd={handleAddTag}
        type="tag"
      />
      <AddFieldModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        availableOptions={availableFields}
        onAdd={handleAddField}
        type="field"
      />
    </div>
  );
}