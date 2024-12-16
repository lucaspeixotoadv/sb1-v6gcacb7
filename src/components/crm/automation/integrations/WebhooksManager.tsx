import React, { useState } from 'react';
import { Plus, X, Save, Copy, Settings, ChevronDown } from 'lucide-react';
import { useWebhookStore } from '../../../../features/automation/store/webhookStore';

interface WebhooksManagerProps {
  onConfigureWebhook: (webhookId: string) => void;
}

export function WebhooksManager({ onConfigureWebhook }: WebhooksManagerProps) {
  const { webhooks, addWebhook, deleteWebhook, toggleMode } = useWebhookStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addWebhook({ title, description });
    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Webhooks</h3>
          <p className="text-sm text-gray-500">
            Receba dados externos através de URLs únicas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Webhook
        </button>
      </div>

      {/* Lista de Webhooks */}
      {webhooks.length > 0 ? (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h4 className="font-medium">{webhook.title}</h4>
                    <div className="relative inline-flex items-center">
                      <div
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                          webhook.mode === 'production' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        onClick={() => toggleMode(webhook.id)}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            webhook.mode === 'production' ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {webhook.mode === 'production' ? 'Produção' : 'Teste'}
                      </span>
                    </div>
                  </div>
                  {webhook.description && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedDescription(
                          expandedDescription === webhook.id ? null : webhook.id
                        )}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform ${
                            expandedDescription === webhook.id ? 'rotate-180' : ''
                          }`}
                        />
                        Detalhes
                      </button>
                      {expandedDescription === webhook.id && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {webhook.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onConfigureWebhook(webhook.id);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                    title="Configurar"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                <input
                  type="text"
                  value={webhook.url}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(webhook.url)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copiar URL"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Nenhum webhook configurado
          </h3>
          <p className="text-sm text-gray-500">
            Clique no botão acima para criar seu primeiro webhook
          </p>
        </div>
      )}
    </div>
  );
}