import React from 'react';
import {
  Mail,
  Calendar,
  Tag,
  Phone,
  Edit2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import type { Contact } from '../../types';
import { useContacts } from '../../hooks/useContacts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../hooks/useSettings';

interface ContactDetailsProps {
  contact: Contact;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  className?: string;
}

interface AddFieldModalProps {
  isOpen: boolean;
  availableOptions: { key: string; label: string }[];
  onClose: () => void;
  onAdd: (key: string, value: string) => void;
  type: 'tag' | 'field';
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY + 5
    });
    setShowTooltip(true);
  };

  React.useEffect(() => {
    if (showTooltip && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (rect.right > viewportWidth) {
        setPosition(prev => ({
          ...prev,
          x: viewportWidth - rect.width - 10
        }));
      }
    }
  }, [showTooltip]);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded shadow-lg max-w-xs"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function AddFieldModal({
  isOpen,
  availableOptions,
  onClose,
  onAdd,
  type
}: AddFieldModalProps) {
  const [selectedKey, setSelectedKey] = React.useState('');
  const [value, setValue] = React.useState('');

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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="Fechar"
          >
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
              {availableOptions.map((option) => (
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
  isExpanded,
  onToggleExpanded,
  className = ''
}: ContactDetailsProps) {
  const {
    updateContact,
    addTagToContact,
    removeTagFromContact,
    addCustomField,
    removeCustomField
  } = useContacts();
  const { settings } = useSettings();
  const [isTagModalOpen, setIsTagModalOpen] = React.useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempContact, setTempContact] = React.useState<Contact>(contact);

  React.useEffect(() => {
    setTempContact(contact);
  }, [contact]);

  const handleChange = (field: string, value: string) => {
    if (!isEditing) return;

    if (field === 'firstName' || field === 'lastName') {
      const firstName = field === 'firstName' ? value : tempContact.firstName;
      const lastName = field === 'lastName' ? value : tempContact.lastName;
      const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();
      
      setTempContact(prev => ({
        ...prev,
        firstName,
        lastName,
        fullName
      }));
    } else {
      setTempContact(prev => ({
        ...prev,
        [field]: value || undefined
      }));
    }
  };

  const handleSaveChanges = () => {
    updateContact(contact.id, tempContact);
    setIsEditing(false);
  };

  const handleCancelChanges = () => {
    setTempContact(contact);
    setIsEditing(false);
  };

  const handleKeyPress = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'i') {
        onToggleExpanded();
      }
    },
    [onToggleExpanded]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleRemoveTag = (tag: string) => {
    removeTagFromContact(contact.id, tag);
  };

  const availableTags = settings.availableTags
    .filter((tag) => !contact.tags.includes(tag))
    .map((tag) => ({ key: tag, label: tag }));

  const availableFields = settings.customFieldDefinitions
    .filter((field) => !(field.key in contact.customFields))
    .map((field) => ({ key: field.key, label: field.label }));

  const handleAddTag = (key: string, value: string) => {
    addTagToContact(contact.id, key);
    setIsTagModalOpen(false);
  };

  const handleAddField = (key: string, value: string) => {
    addCustomField(contact.id, key, value);
    setTempContact((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
    setIsFieldModalOpen(false);
  };

  const handleRemoveCustomField = (key: string) => {
    removeCustomField(contact.id, key);
  };

  return (
    <div
      className={`
        h-full transition-all duration-300 bg-white overflow-hidden
        ${isExpanded ? 'w-[320px]' : 'w-14'}
        ${className}
      `}>
      <div className="flex items-center justify-between px-3 py-3 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpanded}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title={isExpanded ? 'Minimizar' : 'Expandir'}
          >
            {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          {isExpanded && (
            <h2 className="text-sm font-medium text-gray-700">Contato</h2>
          )}
        </div>
        {isExpanded && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelChanges}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Cancelar"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Salvar"
                >
                  <Check size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Editar"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl text-indigo-600 font-medium">
                  {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <input
                  type="text"
                  value={tempContact.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full text-xl font-semibold text-gray-900 px-2 py-1 ${
                    isEditing
                      ? 'bg-white border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      : 'bg-transparent'
                  }`}
                />
                <p className="text-gray-500">Detalhes do Contato</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{contact.phone}</span>
            </div>

            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={tempContact.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full text-gray-600 px-2 py-1 ${
                    isEditing
                      ? 'bg-white border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      : 'bg-transparent'
                  }`}
                />
              </div>
            )}

            {contact.birthDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  {new Date(contact.birthDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <Tag className="w-5 h-5 text-gray-400" />
                {isEditing && (
                  <button
                    onClick={() => setIsTagModalOpen(true)}
                    className="ml-1"
                    title="Adicionar Etiqueta"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 flex items-center"
                  >
                    {tag}
                    <button
                      disabled={!isEditing}
                      onClick={() => handleRemoveTag(tag)}
                      className={`ml-1 text-indigo-700 ${
                        isEditing
                          ? 'hover:text-indigo-900'
                          : 'opacity-50 cursor-not-allowed'
                      } focus:outline-none`}
                      title="Remover etiqueta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Campos Personalizados</h4>
              {isEditing && (
                <button
                  onClick={() => setIsFieldModalOpen(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Adicionar Campo Personalizado"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(contact.customFields).map(([key, value]) => (
                <div key={key} className="flex flex-col p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500">{key}</span>
                      <Tooltip content={value}>
                        <div className="text-sm truncate max-w-[180px]">
                          {value}
                        </div>
                      </Tooltip>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveCustomField(key)}
                        className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                        title="Remover campo"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Created:</span>
                <span className="text-gray-900">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Last Updated:</span>
                <span className="text-gray-900">
                  {new Date(contact.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Notas</h4>
            <textarea
              value={tempContact.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={!isEditing}
              className={`w-full p-2 text-sm ${
                isEditing
                  ? 'bg-white border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  : 'bg-transparent'
              }`}
              rows={4}
              placeholder="Adicionar notas..."
            />
          </div>
        </div>
      )}

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