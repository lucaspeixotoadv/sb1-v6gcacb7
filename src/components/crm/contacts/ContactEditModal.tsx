import React, { useState } from 'react';
import { X, Save, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { useContacts } from '../../../hooks/useContacts';
import { useSettings } from '../../../hooks/useSettings';
import type { Contact } from '../../../types';
import type { CustomFieldDefinition } from '../../../features/settings/types';

interface ContactEditModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
}

export const ContactEditModal: React.FC<ContactEditModalProps> = ({ isOpen, contact, onClose }) => {
  const { updateContact, addTagToContact, removeTagFromContact } = useContacts();
  const { settings } = useSettings();
  const [selectedTag, setSelectedTag] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [localTags, setLocalTags] = useState<string[]>(contact.tags);
  const [localCustomFields, setLocalCustomFields] = useState(contact.customFields);

  const handleSubmit = (data: Partial<Contact>) => {
    updateContact(contact.id, data);
    onClose();
  };

  const handleAddTag = () => {
    if (selectedTag && !localTags.includes(selectedTag)) {
      addTagToContact(contact.id, selectedTag);
      setLocalTags(prev => [...prev, selectedTag]);
      setSelectedTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    removeTagFromContact(contact.id, tag);
    setLocalTags(prev => prev.filter(t => t !== tag));
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    updateContact(contact.id, {
      customFields: {
        ...contact.customFields,
        [key]: value
      }
    });

    setLocalCustomFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderCustomField = (field: CustomFieldDefinition) => {
    const value = localCustomFields[field.key] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.label}
          />
        );

      case 'currency':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.key, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${field.label} (R$)`}
            step="0.01"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const renderCustomFieldsSection = () => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campos Personalizados
        </label>
        <div className="space-y-2 border rounded-lg divide-y">
          {settings.folders.fields.map((folder) => {
            const isExpanded = expandedFolders[folder.id];
            const folderFields = settings.customFieldDefinitions.filter(
              field => folder.items.includes(field.key)
            );

            if (folderFields.length === 0) return null;

            return (
              <div key={folder.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.id)}
                  className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-sm">{folder.name}</span>
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 py-3 space-y-4 bg-gray-50">
                    {folderFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm text-gray-600 mb-1">
                          {field.label}
                        </label>
                        {renderCustomField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Campos não categorizados */}
        {settings.customFieldDefinitions.some(field => 
          !settings.folders.fields.some(folder => 
            folder.items.includes(field.key)
          )
        ) && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Outros Campos</h4>
            <div className="space-y-4">
              {settings.customFieldDefinitions
                .filter(field => 
                  !settings.folders.fields.some(folder => 
                    folder.items.includes(field.key)
                  )
                )
                .map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-gray-600 mb-1">
                      {field.label}
                    </label>
                    {renderCustomField(field)}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">Editar Contato</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <ContactForm
                initialData={contact}
                onSubmit={handleSubmit}
              />
            </div>

            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecionar etiqueta...</option>
                    {settings.availableTags
                      .filter(tag => !localTags.includes(tag))
                      .map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!selectedTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {localTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              {renderCustomFieldsSection()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactEditModal;