import React, { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { useWebhookStore } from '../../../../features/automation/store/webhookStore';
import { WebhookRequestViewer } from './WebhookRequestViewer';
import { WebhookActionForm } from './WebhookActionForm';
import { WebhookFieldSelector } from './WebhookFieldSelector';
import { Button } from '@/components/ui/Button';
import { WebhookConfigModal } from './WebhookConfigModal';
import type { WebhookConfig, WebhookRequest } from '../../../../features/automation/types';

interface WebhookConfigScreenProps {
  webhookId: string;
  onBack: () => void;
}

export function WebhookConfigScreen({ webhookId, onBack }: WebhookConfigScreenProps) {
  const { webhooks, updateWebhookConfig, getRequests } = useWebhookStore();
  const webhook = webhooks.find(w => w.id === webhookId);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(null);

  if (!webhook) return null;

  const requests = getRequests(webhookId);

  const handleSaveConfig = (config: WebhookConfig) => {
    updateWebhookConfig(webhookId, config);
    setShowConfig(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold">{webhook.title}</h2>
            <p className="text-sm text-gray-500">Configurar webhook e ações</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* URL do Webhook */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">URL do Webhook</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhook.url}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg"
              />
              <button
                onClick={() => navigator.clipboard.writeText(webhook.url)}
                className="px-4 py-2 text-black border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>
          
          {/* Configuração de Campos */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mapeamento de Campos</h3>
              <Button
                onClick={() => setShowConfig(true)}
                className="bg-black text-white hover:bg-black/90 transition-colors"
              >
                <Save size={20} />
                Configurar Campos
              </Button>
            </div>

            {webhook.config ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Campos Mapeados
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(webhook.config.fieldMappings).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{key}:</span>
                        <span className="text-sm text-gray-600 ml-2">{value.field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Clique em "Configurar Campos" para mapear os campos do webhook
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}