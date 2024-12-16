import React from 'react';
import { X } from 'lucide-react';
import { CompanySettings } from './CompanySettings';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanySettingsModal({ isOpen, onClose }: CompanySettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-[99999]">
          <h2 className="text-xl font-semibold">Configurações da Empresa</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <CompanySettings onSave={onClose} />
        </div>
      </div>
    </div>
  );
}