import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '../../../../hooks/useSettings';
import type { WebhookConfig } from '../../../../features/automation/types';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WebhookConfig) => void;
  initialConfig?: WebhookConfig;
}

export function WebhookConfigModal({ isOpen, onClose, onSave, initialConfig }: WebhookConfigModalProps) {
  const { settings } = useSettings();
  const [config, setConfig] = useState<WebhookConfig>(initialConfig || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">Configurar Webhook</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mapeamento de Campos Básicos */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Campos Básicos</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campo do Telefone
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.phone?.field || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      phone: { field: e.target.value, required: true }
                    }))}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Ex: phone, whatsapp, telefone"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Campo que contém o número do WhatsApp no formato internacional (Ex: +5511999999999)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campo do Nome
                </label>
                <input
                  type="text"
                  value={config.name?.field || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    name: { field: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: name, nome, full_name"
                />
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Etiquetas</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {settings.availableTags.map(tag => (
                  <label key={tag} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={config.tags?.includes(tag) || false}
                      onChange={(e) => {
                        setConfig(prev => ({
                          ...prev,
                          tags: e.target.checked
                            ? [...(prev.tags || []), tag]
                            : (prev.tags || []).filter(t => t !== tag)
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Etiquetas que serão adicionadas automaticamente ao contato
              </p>
            </div>
          </div>

          {/* Campos Personalizados */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Campos Personalizados</h4>
              <button
                type="button"
                onClick={() => setConfig(prev => ({
                  ...prev,
                  customFields: {
                    ...prev.customFields,
                    '': { field: '' }
                  }
                }))}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} className="inline mr-1" />
                Adicionar Campo
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(config.customFields || {}).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={key}
                    onChange={(e) => {
                      const oldKey = key;
                      const newKey = e.target.value;
                      setConfig(prev => {
                        const { [oldKey]: _, ...rest } = prev.customFields || {};
                        return {
                          ...prev,
                          customFields: {
                            ...rest,
                            [newKey]: value
                          }
                        };
                      });
                    }}
                    className="w-48 px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione um campo...</option>
                    {settings.customFieldDefinitions.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={value.field}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      customFields: {
                        ...(prev.customFields || {}),
                        [key]: { ...value, field: e.target.value }
                      }
                    }))}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Campo no payload"
                  />
                  <button
                    type="button"
                    onClick={() => setConfig(prev => {
                      const { [key]: _, ...rest } = prev.customFields || {};
                      return {
                        ...prev,
                        customFields: rest
                      };
                    })}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
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
              Salvar Configuração
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}