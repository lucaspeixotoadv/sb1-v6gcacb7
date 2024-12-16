import React from 'react';
import { X, Save } from 'lucide-react';
import { useContacts } from '../../../../hooks/useContacts';
import { useSettings } from '../../../../hooks/useSettings';
import { Button } from '@/components/ui/Button';
import type { Deal } from '../../types';

const DEFAULT_FORM_DATA: Partial<Deal> = {
  title: '',
  value: 0,
  priority: 'medium',
  status: 'active',
  tags: [],
  customFields: {},
};

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: Partial<Deal>) => void;
  initialStageId: string;
}

export function DealFormModal({ isOpen, onClose, onSubmit, initialStageId }: DealFormModalProps) {
  const { contacts } = useContacts();
  const { settings } = useSettings();

  const [formData, setFormData] = React.useState<Partial<Deal>>(DEFAULT_FORM_DATA);

  React.useEffect(() => {
    // Reset form when modal opens/closes
    if (isOpen) {
      setFormData({
        ...DEFAULT_FORM_DATA,
        stage: initialStageId,
        contactId: contacts[0]?.id || ''
      });
    }
  }, [isOpen, initialStageId, contacts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.title?.trim()) {
      alert('O título da oportunidade é obrigatório');
      return;
    }
    
    if (!formData.contactId) {
      alert('Selecione um cliente/empresa');
      return; // Não submete se os campos obrigatórios estiverem vazios
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Nova Oportunidade</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Oportunidade
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Estimado
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    priority: e.target.value as Deal['priority']
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Prevista de Fechamento
                </label>
                <input
                  type="date"
                  value={formData.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dueDate: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente/Empresa
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <select
                  multiple
                  value={formData.tags}
                  onChange={(e) => {
                    const tags = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, tags }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {settings.availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit" 
              variant="primary"
            >
              <Save size={20} />
              Criar Oportunidade
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}