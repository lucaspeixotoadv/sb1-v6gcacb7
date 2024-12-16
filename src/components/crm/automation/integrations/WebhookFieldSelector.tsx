import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface WebhookFieldSelectorProps {
  data: any;
  onSelect: (path: string) => void;
  onCancel: () => void;
}

export function WebhookFieldSelector({ data, onSelect, onCancel }: WebhookFieldSelectorProps) {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  
  const getCurrentObject = () => {
    return currentPath.reduce((obj, key) => obj[key], data);
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'object') {
      return Array.isArray(value) ? `Array[${value.length}]` : 'Object';
    }
    return String(value);
  };

  const handleSelect = (key: string) => {
    const value = getCurrentObject()[key];
    if (value && typeof value === 'object') {
      setCurrentPath([...currentPath, key]);
    } else {
      // Constrói o caminho completo para o campo selecionado
      const fullPath = [...currentPath, key].join('.');
      onSelect(fullPath);
      onCancel(); // Fecha o seletor após a seleção
    }
  };

  const handleBack = () => {
    if (currentPath.length === 0) {
      onCancel();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const currentObject = getCurrentObject() || data;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Selecione o campo desejado</h4>
        <p className="text-sm text-gray-500">
          Navegue pela estrutura dos dados e clique no campo que deseja utilizar
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={handleBack}
          className="px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
        >
          {currentPath.length === 0 ? 'Cancelar' : 'Voltar'}
        </button>
        {currentPath.length > 0 && (
          <>
            <span className="text-gray-400">/</span>
            {currentPath.map((path, index) => (
              <React.Fragment key={index}>
                <span className="text-gray-600">{path}</span>
                {index < currentPath.length - 1 && (
                  <span className="text-gray-400">/</span>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Field List */}
      <div className="space-y-2">
        {Object.entries(currentObject).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`
              w-full flex items-center justify-between p-3 
              ${typeof value === 'object' ? 'bg-gray-50' : 'bg-white'} 
              border hover:border-blue-500 rounded-lg text-left 
              transition-colors cursor-pointer
            `}
          >
            <div>
              <span className="font-medium text-gray-900">{key}</span>
              <span className="ml-2 text-sm text-gray-500">
                {formatValue(value)}
              </span>
            </div>
            {value && typeof value === 'object' ? (
              <ChevronRight className="text-gray-400 group-hover:text-gray-600" size={16} /> 
            ) : (
              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">
                Selecionar
              </span>
            )}
          </button>
        ))}
        
        {Object.keys(currentObject).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum campo disponível neste nível
          </div>
        )}
      </div>
    </div>
  );
}