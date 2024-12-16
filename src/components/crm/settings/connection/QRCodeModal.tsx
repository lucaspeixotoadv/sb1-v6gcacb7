import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string | null;
}

export function QRCodeModal({ isOpen, onClose, qrCode }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Conectar WhatsApp</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
  );
}