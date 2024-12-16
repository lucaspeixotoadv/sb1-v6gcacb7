import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import type { Pipeline } from '../../../../types';

interface PipelineListSelectorProps {
  type: Pipeline['type'];
  pipelines: Pipeline[];
  onSelectPipeline: (pipelineId: string) => void;
  onCreatePipeline: () => void;
  onBack: () => void;
}

export function PipelineListSelector({ 
  type, 
  pipelines,
  onSelectPipeline,
  onCreatePipeline,
  onBack
}: PipelineListSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100"
        >
          Voltar
        </button>
        <h2 className="text-2xl font-semibold">
          {type === 'sales' ? 'Pipelines Comerciais' :
           type === 'support' ? 'Pipelines de Suporte' :
           'Pipelines Personalizados'}
        </h2>
      </div>

      <div className="grid gap-4">
        <button
          onClick={onCreatePipeline}
          className="flex items-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow border-dashed border-gray-300 group"
        >
          <div className="p-3 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 mr-4">
            <Plus size={24} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center">
              Criar Novo Pipeline
              <ChevronRight 
                size={16} 
                className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" 
              />
            </h3>
            <p className="text-sm text-gray-500">
              {type === 'sales' ? 'Configure um novo pipeline de vendas com suas próprias etapas' :
               type === 'support' ? 'Crie um novo fluxo de atendimento personalizado' :
               'Defina um pipeline totalmente personalizado para seu processo'}
            </p>
          </div>
        </button>

        {pipelines.map(pipeline => (
          <button
            key={pipeline.id}
            onClick={() => onSelectPipeline(pipeline.id)}
            className="flex items-start p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className={`p-3 rounded-lg ${
              type === 'sales' ? 'bg-blue-50 text-blue-500' :
              type === 'support' ? 'bg-green-50 text-green-500' :
              'bg-purple-50 text-purple-500'
            } mr-4`}>
              <div className="w-6 h-6 rounded-full bg-current" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 mb-1 flex items-center">
                {pipeline.name}
                <ChevronRight 
                  size={16} 
                  className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" 
                />
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{pipeline.stages.length} etapas</span>
                <span>{pipeline.stages.reduce((sum, stage) => sum + stage.deals.length, 0)} oportunidades</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}