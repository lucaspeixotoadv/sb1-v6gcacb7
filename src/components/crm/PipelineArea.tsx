import React, { useState, useCallback } from 'react';
import { Plus, Filter, ChevronDown, FolderTree } from 'lucide-react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { DealCard } from './pipeline/DealCard';
import { StageColumn } from './pipeline/StageColumn';
import { PipelineSelector } from './pipeline/PipelineSelector';
import { PipelineListSelector } from './pipeline/PipelineListSelector';
import { StageManager } from './pipeline/StageManager';
import { usePipeline } from '../../hooks/usePipeline';
import type { Deal, Stage, Pipeline } from '../../types';

export function PipelineArea() {
  const {
    pipelines,
    activePipeline,
    setActivePipelineId,
    moveDeal,
    addDeal,
    addPipeline,
    deletePipeline
  } = usePipeline();
  const [selectedType, setSelectedType] = useState<Pipeline['type'] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);
  const [newPipeline, setNewPipeline] = useState({
    name: '',
    type: 'custom' as Pipeline['type']
  });
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);

  const filteredPipelines = React.useMemo(() => {
    if (!selectedType) return [];
    return pipelines.filter(p => p.type === selectedType);
  }, [pipelines, selectedType]);

  const handleTypeSelect = useCallback((type: Pipeline['type']) => {
    setSelectedType(type);
    setSelectedPipeline(null);
  }, []);

  if (!selectedType) {
    return <PipelineSelector onSelectType={handleTypeSelect} />;
  }

  if (!selectedPipeline) {
    return (
      <PipelineListSelector
        type={selectedType}
        pipelines={filteredPipelines}
        onSelectPipeline={(id) => {
          setSelectedPipeline(id);
          setActivePipelineId(id);
        }}
        onCreatePipeline={() => setShowNewPipelineModal(true)}
        onBack={() => setSelectedType(null)}
      />
    );
  }

  if (!activePipeline) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Selecione um pipeline para começar</p>
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId: dealId, source, destination } = result;
    
    if (source.droppableId !== destination.droppableId) {
      moveDeal(dealId, destination.droppableId);
    }
  };

  const handleAddDeal = () => {
    const newDeal: Partial<Deal> = {
      title: 'Nova Oportunidade',
      value: 0,
      stage: activePipeline?.stages[0].id || '',
      priority: 'medium',
      status: 'active',
      tags: [],
      customFields: {}
    };
    addDeal(newDeal);
  };

  const handleAddPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPipeline.name.trim()) {
      addPipeline(newPipeline.name, selectedType || 'custom');
      setNewPipeline({
        name: '',
        type: 'custom'
      });
      setShowNewPipelineModal(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedType(null)}
              className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Voltar
            </button>
            <select
              value={activePipeline.id}
              onChange={(e) => setActivePipelineId(e.target.value)}
              className="px-3 py-2 border rounded-lg text-gray-700 min-w-[250px] focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              {filteredPipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredPipelines.length} {
                selectedType === 'sales' ? 'Pipeline(s) Comercial' :
                selectedType === 'support' ? 'Pipeline(s) de Suporte' :
                'Pipeline(s) Personalizado'
              }
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Filter size={20} />
              Filtros
            </button>
            <button
              onClick={handleAddDeal}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Oportunidade
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Content */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {activePipeline.stages.map((stage) => (
              <div key={stage.id} className="w-80">
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <StageColumn
                      stage={stage}
                      provided={provided}
                      deals={activePipeline.deals.filter(deal => deal.stage === stage.id)}
                    />
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Stage Manager Modal */}
      {showStageManager && (
        <StageManager
          isOpen={showStageManager}
          onClose={() => setShowStageManager(false)}
          pipeline={activePipeline}
        />
      )}
    </div>
  );
}

export default PipelineArea;