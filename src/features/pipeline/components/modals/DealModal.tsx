import React, { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePipeline } from '../../../../hooks/usePipeline';
import { useContacts } from '../../../../hooks/useContacts';
import { useSettings } from '../../../../hooks/useSettings';
import type { Deal } from '../../../../types';

interface DealModalProps {
  deal: Deal;
  onClose: () => void;
}

export function DealModal({ deal, onClose }: DealModalProps) {
  const [editedDeal, setEditedDeal] = useState(deal);
  const { contacts } = useContacts();
  const { settings } = useSettings();
  const { updateDeal, deleteDeal } = usePipeline();
  const contact = contacts.find(c => c.id === deal.contactId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeal(deal.id, editedDeal);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta oportunidade?')) {
      deleteDeal(deal.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-50">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Gerenciar Oportunidade</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editedDeal.title}
                  onChange={(e) => setEditedDeal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  value={editedDeal.value}
                  onChange={(e) => setEditedDeal(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={editedDeal.priority}
                  onChange={(e) => setEditedDeal(prev => ({ ...prev, priority: e.target.value as Deal['priority'] }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={editedDeal.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setEditedDeal(prev => ({
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
                  Contato
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {contact?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{contact?.name}</p>
                    <p className="text-sm text-gray-500">{contact?.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <select
                  multiple
                  value={editedDeal.tags}
                  onChange={(e) => {
                    const tags = Array.from(e.target.selectedOptions, option => option.value);
                    setEditedDeal(prev => ({ ...prev, tags }));
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
                  value={editedDeal.description || ''}
                  onChange={(e) => setEditedDeal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={20} />
              Excluir Oportunidade
            </Button>
            <div className="flex gap-2">
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
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}