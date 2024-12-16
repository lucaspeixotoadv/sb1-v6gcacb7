import React from 'react';
import { Plus, Filter, ChevronDown, Settings, ChevronLeft } from 'lucide-react';
import type { Pipeline } from '../../../../types';

interface PipelineHeaderProps {
  pipeline: Pipeline;
  pipelines: Pipeline[];
  onAddDeal: () => void;
  onManageStages: () => void;
  onBack: () => void;
  onChangePipeline: (id: string) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export function PipelineHeader({
  pipeline,
  pipelines,
  onAddDeal,
  onManageStages,
  onBack,
  onChangePipeline,
  onToggleFilters,
  showFilters
}: PipelineHeaderProps) {
  const filteredPipelines = pipelines.filter(p => p.type === pipeline.type);

  return (
    <div className="p-6 bg-white border-b">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <select
            value={pipeline.id}
            onChange={(e) => onChangePipeline(e.target.value)}
            className="text-lg font-semibold text-gray-900 px-3 py-2 border rounded-lg min-w-[250px]"
          >
            {filteredPipelines.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={onManageStages}
            className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100"
            title="Gerenciar Pipeline"
          >
            <Settings size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={20} />
            Filtros
            <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={onAddDeal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Oportunidade
          </button>
        </div>
      </div>
    </div>
  );
}