import React from 'react';
import { ListOrdered } from 'lucide-react';

export function SequencesSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <ListOrdered className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sequências em Breve
        </h3>
        <p className="text-gray-500">
          Crie sequências automatizadas de mensagens para nutrir seus leads.
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
}