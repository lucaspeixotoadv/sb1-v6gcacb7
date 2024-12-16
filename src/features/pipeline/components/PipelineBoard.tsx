import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, Filter } from 'lucide-react';
import { StageColumn } from './StageColumn';
import { usePipelineState } from '../hooks/usePipelineState';
import type { DragResult } from '../types';

export function PipelineBoard() {
  const { 
    activePipeline, 
    handleDragStart,
    handleDragEnd, 
    addDeal,
    isDragging 
  } = usePipelineState();
  const [showFilters, setShowFilters] = React.useState(false);

  if (!activePipeline) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Selecione um pipeline para começar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{activePipeline.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={20} />
              Filtros
            </button>
            <button
              onClick={() => {
                if (activePipeline.stages[0]) {
                  addDeal(activePipeline.stages[0].id, {
                    title: 'Nova Oportunidade',
                    value: 0,
                    priority: 'medium',
                    status: 'active',
                    tags: []
                  });
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Oportunidade
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className={`flex gap-4 h-full ${isDragging ? 'cursor-grabbing' : ''}`}>
            {activePipeline.stages.map(stage => (
              <StageColumn key={stage.id} stage={stage} />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}