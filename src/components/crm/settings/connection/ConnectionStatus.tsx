import React from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import type { ZAPIStatus } from '@/services/zapi/types';

interface ConnectionStatusProps {
  status: ZAPIStatus | null;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (!status) return null;

  return (
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
  );
}