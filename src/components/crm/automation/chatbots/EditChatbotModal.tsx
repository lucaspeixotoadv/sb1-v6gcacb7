import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Chatbot } from '../../../../features/automation/types';

interface EditChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: { name: string; description?: string; group?: string }) => void;
  chatbot: Chatbot;
}

const GROUPS = {
  whatsapp: [
    { id: 'atendimento', name: 'Atendimento' },
    { id: 'vendas', name: 'Vendas' },
    { id: 'suporte', name: 'Suporte' },
    { id: 'marketing', name: 'Marketing' }
  ]
};

export function EditChatbotModal({ isOpen, onClose, onSubmit, chatbot }: EditChatbotModalProps) {
  const [name, setName] = useState(chatbot.name);
  const [description, setDescription] = useState(chatbot.description || '');
  const [group, setGroup] = useState(chatbot.group || '');

  // Atualiza os campos quando o chatbot mudar
  useEffect(() => {
    setName(chatbot.name);
    setDescription(chatbot.description || '');
    setGroup(chatbot.group || '');
  }, [chatbot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit(chatbot.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      group: group || undefined
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">Editar Chatbot</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Chatbot
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Atendimento Comercial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Descreva o propósito deste chatbot..."
            />
          </div>

          {chatbot.channel === 'whatsapp' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo (opcional)
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sem grupo</option>
                {GROUPS.whatsapp.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

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