import React, { useState } from 'react';
import { X, Save, MessageSquare, Instagram, Facebook } from 'lucide-react';
import type { Chatbot } from '../../../../features/automation/types';

interface CreateChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; channel: Chatbot['channel'] }) => void;
}

const CHANNELS = [
  { 
    id: 'whatsapp' as const, 
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'bg-green-500',
    available: true
  },
  { 
    id: 'instagram' as const, 
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-500',
    available: false
  },
  { 
    id: 'facebook' as const, 
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-500',
    available: false
  }
];

export function CreateChatbotModal({ isOpen, onClose, onSubmit }: CreateChatbotModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<Chatbot['channel']>('whatsapp');
  const [group, setGroup] = useState<string>('');

  const GROUPS = {
    whatsapp: [
      { id: 'atendimento', name: 'Atendimento' },
      { id: 'vendas', name: 'Vendas' },
      { id: 'suporte', name: 'Suporte' },
      { id: 'marketing', name: 'Marketing' }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      channel,
      group: group || undefined
    });

    setName('');
    setDescription('');
    setChannel('whatsapp');
    setGroup('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">Novo Chatbot</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Canal
            </label>
            <div className="grid grid-cols-3 gap-4">
              {CHANNELS.map(({ id, name, icon: Icon, color, available }) => (
                <button
                  key={id}
                  type="button"
                  disabled={!available}
                  onClick={() => available && setChannel(id)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-center
                    ${!available && 'opacity-50 cursor-not-allowed'}
                    ${channel === id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className={`p-3 rounded-full ${color} text-white mx-auto mb-3 w-fit`}>
                    <Icon size={24} />
                  </div>
                  <span className="font-medium">{name}</span>
                  {!available && (
                    <span className="absolute top-2 right-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

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

          {channel === 'whatsapp' && (
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
              Criar Chatbot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}