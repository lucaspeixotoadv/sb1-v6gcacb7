import React from 'react';
import { X, Save, Clock, Variable, RotateCcw } from 'lucide-react';
import type { TextNodeData } from '../../../types/nodes';

interface TextMessageConfigModalProps {
  isOpen: boolean;
  data: TextNodeData;
  onClose: () => void;
  onSave: (data: TextNodeData) => void;
}

export function TextMessageConfigModal({ isOpen, data, onClose, onSave }: TextMessageConfigModalProps) {
  const [config, setConfig] = React.useState(data);
  const [showResponseConfig, setShowResponseConfig] = React.useState(!!data.waitForResponse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showResponseConfig) {
      const { waitForResponse, ...rest } = config;
      onSave(rest);
    } else {
      onSave(config);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div 
        className="relative flex flex-col bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] m-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixo no topo */}
        <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-lg">
          <h3 className="text-xl font-semibold text-gray-800">Configurar Mensagem de Texto</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com scroll próprio */}
        <div className="flex-1 overflow-y-auto">
          <form id="config-form" onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Conteúdo da Mensagem */}
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={config.content}
                  onChange={(e) => setConfig(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  rows={4}
                  placeholder="Digite sua mensagem..."
                  required
                />
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                  <Variable size={16} />
                  Use {'{nome}'} para inserir variáveis
                </p>
              </div>
            </div>

            {/* Configuração de Resposta */}
            <div className="p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showResponseConfig}
                      onChange={(e) => setShowResponseConfig(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-base font-medium text-gray-700">
                      Aguardar resposta do usuário
                    </span>
                  </label>
                </div>

                {showResponseConfig && (
                  <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
                    {/* Nome da Variável */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Variable size={16} />
                        Nome da Variável
                      </label>
                      <input
                        type="text"
                        value={config.waitForResponse?.variableName || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          waitForResponse: {
                            ...prev.waitForResponse,
                            variableName: e.target.value,
                            required: prev.waitForResponse?.required ?? true
                          }
                        }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: resposta_usuario"
                        required={showResponseConfig}
                      />
                    </div>

                    {/* Resposta Obrigatória */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.waitForResponse?.required ?? true}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          waitForResponse: {
                            ...prev.waitForResponse,
                            required: e.target.checked
                          }
                        }))}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Resposta obrigatória
                      </span>
                    </div>

                    {/* Configuração de Timeout */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                        <Clock size={16} />
                        Tempo Limite (Timeout)
                      </label>

                      <div className="pl-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={config.waitForResponse?.timeout?.enabled ?? false}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              waitForResponse: {
                                ...prev.waitForResponse,
                                timeout: {
                                  ...prev.waitForResponse?.timeout,
                                  enabled: e.target.checked,
                                  value: prev.waitForResponse?.timeout?.value ?? 60,
                                  unit: prev.waitForResponse?.timeout?.unit ?? 'seconds'
                                }
                              }
                            }))}
                            className="w-5 h-5 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            Ativar tempo limite
                          </span>
                        </div>

                        {config.waitForResponse?.timeout?.enabled && (
                          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Tempo
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={config.waitForResponse.timeout.value}
                                  onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    waitForResponse: {
                                      ...prev.waitForResponse,
                                      timeout: {
                                        ...prev.waitForResponse?.timeout,
                                        value: parseInt(e.target.value)
                                      }
                                    }
                                  }))}
                                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Unidade
                                </label>
                                <select
                                  value={config.waitForResponse.timeout.unit}
                                  onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    waitForResponse: {
                                      ...prev.waitForResponse,
                                      timeout: {
                                        ...prev.waitForResponse?.timeout,
                                        unit: e.target.value as 'seconds' | 'minutes' | 'hours'
                                      }
                                    }
                                  }))}
                                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="seconds">Segundos</option>
                                  <option value="minutes">Minutos</option>
                                  <option value="hours">Horas</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Mensagem de Timeout
                              </label>
                              <input
                                type="text"
                                value={config.waitForResponse.timeout.message || ''}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  waitForResponse: {
                                    ...prev.waitForResponse,
                                    timeout: {
                                      ...prev.waitForResponse?.timeout,
                                      message: e.target.value
                                    }
                                  }
                                }))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: Tempo limite excedido. Por favor, tente novamente."
                              />
                            </div>

                            {/* Configuração de Retry */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={config.waitForResponse.timeout.retryEnabled ?? false}
                                  onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    waitForResponse: {
                                      ...prev.waitForResponse,
                                      timeout: {
                                        ...prev.waitForResponse?.timeout,
                                        retryEnabled: e.target.checked,
                                        maxRetries: prev.waitForResponse?.timeout?.maxRetries ?? 3,
                                        retryDelay: prev.waitForResponse?.timeout?.retryDelay ?? 60
                                      }
                                    }
                                  }))}
                                  className="w-5 h-5 rounded border-gray-300"
                                />
                                <div className="flex items-center gap-2">
                                  <RotateCcw size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    Permitir novas tentativas
                                  </span>
                                </div>
                              </div>

                              {config.waitForResponse.timeout.retryEnabled && (
                                <div className="pl-6 grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                      Máximo de tentativas
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={config.waitForResponse.timeout.maxRetries}
                                      onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        waitForResponse: {
                                          ...prev.waitForResponse,
                                          timeout: {
                                            ...prev.waitForResponse?.timeout,
                                            maxRetries: parseInt(e.target.value)
                                          }
                                        }
                                      }))}
                                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                      Intervalo (segundos)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={config.waitForResponse.timeout.retryDelay}
                                      onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        waitForResponse: {
                                          ...prev.waitForResponse,
                                          timeout: {
                                            ...prev.waitForResponse?.timeout,
                                            retryDelay: parseInt(e.target.value)
                                          }
                                        }
                                      }))}
                                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixo no fundo */}
        <div className="border-t bg-white p-6 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="config-form"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}