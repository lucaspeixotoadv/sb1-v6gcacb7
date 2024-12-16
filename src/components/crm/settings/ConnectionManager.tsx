```typescript
import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Check, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMessaging } from '../../../contexts/MessagingContext';
import { TokenStorage } from '../../../services/security/tokenStorage';
import { Button } from '../../ui/Button';
import type { ZAPIConfig } from '../../../services/zapi/types';

export function ConnectionManager() {
  const [config, setConfig] = useState<ZAPIConfig>({
    instanceId: '',
    token: '',
    clientToken: '',
    webhookUrl: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { initialize, connect, status, qrCode } = useMessaging();

  useEffect(() => {
    const savedTokens = TokenStorage.getTokens();
    if (savedTokens && TokenStorage.isValid()) {
      setConfig(savedTokens);
      setIsConfigured(true);
      initialize(savedTokens);
    }
  }, [initialize]);

  const handleSaveConfig = () => {
    if (!config.instanceId || !config.token || !config.clientToken) {
      alert('Todos os campos são obrigatórios');
      return;
    }

    try {
      TokenStorage.saveTokens(config);
      setIsConfigured(true);
      initialize(config);
    } catch (error) {
      console.error('Error saving tokens:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Tem certeza que deseja desconectar? Você precisará reconfigurar as credenciais.')) {
      TokenStorage.clearTokens();
      setIsConfigured(false);
      setConfig({
        instanceId: '',
        token: '',
        clientToken: '',
        webhookUrl: ''
      });
      setShowQRCode(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Conexão com WhatsApp</h3>
        {status && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            {status.session === 'connected' ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check size={16} /> Conectado
              </span>
            ) : status.session === 'connecting' ? (
              <span className="flex items-center gap-1 text-yellow-600">
                <RefreshCw size={16} className="animate-spin" /> Conectando
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <X size={16} /> Desconectado
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID da Instância Z-API
          </label>
          <input
            type="text"
            value={config.instanceId}
            onChange={(e) => setConfig(prev => ({ ...prev, instanceId: e.target.value }))}
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
            value={config.token}
            onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
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
            value={config.clientToken}
            onChange={(e) => setConfig(prev => ({ ...prev, clientToken: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            placeholder="Ex: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            disabled={isConfigured}
          />
          <p className="mt-1 text-xs text-gray-500">
            Token de autenticação do cliente fornecido pela Z-API
          </p>
        </div>

        <div className="flex gap-2">
          {!isConfigured ? (
            <Button
              onClick={handleSaveConfig}
              variant="primary"
              disabled={!config.instanceId || !config.token || !config.clientToken}
            >
              Salvar Configuração
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleDisconnect}
              >
                Desconectar
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowQRCode(true)}
                disabled={!isConfigured || status?.connected}
              >
                <QrCode size={20} className="mr-2" />
                Conectar WhatsApp
              </Button>
            </>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Conectar WhatsApp</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center">
              <p className="mb-4 text-gray-600">
                Escaneie o QR Code com seu WhatsApp para conectar
              </p>
              {qrCode ? (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw size={32} className="animate-spin text-gray-400" />
                </div>
              )}
              <div className="space-y-2 text-sm text-gray-500">
                <p>1. Abra o WhatsApp no seu celular</p>
                <p>2. Toque em Menu ou Configurações e selecione WhatsApp Web</p>
                <p>3. Aponte seu celular para esta tela para capturar o código</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```