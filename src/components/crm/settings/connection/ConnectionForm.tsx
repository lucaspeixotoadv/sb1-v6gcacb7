import React, { useState, useEffect } from 'react';
import { Link } from 'lucide-react';
import { getWebhookUrl } from '../../../../utils/environment';
import type { ZAPIConfig } from '@/services/zapi/types';

interface ConnectionFormProps {
  config: ZAPIConfig;
  isConfigured: boolean;
  onSave: (config: ZAPIConfig) => void;
}

export function ConnectionForm({ config, isConfigured, onSave }: ConnectionFormProps) {
  const [formData, setFormData] = useState(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (field: keyof ZAPIConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Webhook URL Display */}
      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            URL do Webhook
          </label>
          <button
            onClick={() => navigator.clipboard.writeText(getWebhookUrl())}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Link size={14} />
            Copiar URL
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={getWebhookUrl()}
            readOnly
            className="w-full p-2 bg-white border rounded-lg text-gray-600 text-sm font-mono"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Esta é a URL que receberá as notificações da Z-API
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID da Instância Z-API
        </label>
        <input
          type="text"
          value={formData.instanceId}
          onChange={handleChange('instanceId')}
          className="w-full p-2 border rounded-lg"
          placeholder="Ex: XXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          disabled={isConfigured}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Token da Instância
        </label>
        <input
          type="password"
          value={formData.token}
          onChange={handleChange('token')}
          className="w-full p-2 border rounded-lg"
          placeholder="Ex: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          disabled={isConfigured}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Token
        </label>
        <input
          type="password"
          value={formData.clientToken}
          onChange={handleChange('clientToken')}
          className="w-full p-2 border rounded-lg"
          placeholder="Ex: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          disabled={isConfigured}
        />
        <p className="mt-1 text-xs text-gray-500">
          Token de autenticação do cliente fornecido pela Z-API
        </p>
      </div>

      {!isConfigured && (
        <button
          onClick={() => onSave(formData)}
          disabled={!formData.instanceId || !formData.token || !formData.clientToken}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Salvar Configuração
        </button>
      )}
    </div>
  );
}