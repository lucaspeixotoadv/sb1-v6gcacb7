import React from 'react';
import { MousePointer } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import { ButtonConfigModal } from './ButtonConfigModal';
import type { ActionButtonConfig } from './types';

interface ActionButtonNodeProps {
  data: {
    config: ActionButtonConfig;
  };
}

export function ActionButtonNode({ data }: ActionButtonNodeProps) {
  const [showConfig, setShowConfig] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfig(true);
  };

  const handleSave = (config: ActionButtonConfig) => {
    data.config = config;
    setShowConfig(false);
  };

  return (
    <>
      <BaseNode 
        data={data}
        className="cursor-pointer hover:border-blue-500"
        onNodeClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <MousePointer size={16} className="text-green-600" />
          <span className="font-medium">Botão de Ação</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {data.config?.label || 'Clique para configurar'}
        </div>
      </BaseNode>

      <ButtonConfigModal
        isOpen={showConfig}
        data={data.config}
        onClose={() => setShowConfig(false)}
        onSave={handleSave}
      />
    </>
  );
}