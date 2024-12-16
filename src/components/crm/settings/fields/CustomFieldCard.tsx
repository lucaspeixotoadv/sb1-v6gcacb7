import React from 'react';
import { Trash2 } from 'lucide-react';
import type { CustomFieldDefinition } from '../../../../features/settings/types';

interface CustomFieldCardProps {
  field: CustomFieldDefinition;
  onRemove: () => void;
}

export function CustomFieldCard({ field, onRemove }: CustomFieldCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{field.label}</h4>
          <p className="text-sm text-gray-500">Chave: {field.key}</p>
          <p className="text-sm text-gray-500">Tipo: {field.type}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}