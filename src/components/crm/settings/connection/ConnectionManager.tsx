import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { ConnectionForm } from './ConnectionForm';
import { QRCodeModal } from './QRCodeModal';
import { useConnectionManager } from './useConnectionManager';

export function ConnectionManager() {
  const {
    config,
    isConfigured,
    showQRCode,
    status,
    qrCode,
    handleSaveConfig,
    handleDisconnect,
    setShowQRCode
  } = useConnectionManager();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Conexão com WhatsApp</h3>
        <ConnectionStatus status={status} />
      </div>

      <ConnectionForm
        config={config}
        isConfigured={isConfigured}
        onSave={handleSaveConfig}
      />

      {isConfigured && (
        <div className="flex gap-2">
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Desconectar
          </button>
          <button
            onClick={() => setShowQRCode(true)}
            disabled={status?.connected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Conectar WhatsApp
          </button>
        </div>
      )}

      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        qrCode={qrCode}
      />
    </div>
  );
}