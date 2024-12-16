import React, { memo } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { DealCard } from './DealCard';
import type { Stage, Deal } from '../../../types';

interface StageColumnProps {
  stage: Stage;
}

export const StageColumn = memo(function StageColumn({ stage }: StageColumnProps) {
  const totalValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-lg p-4">
      {/* Cabeçalho do Stage */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4" data-stage-id={stage.id}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{stage.name}</h3>
          <span className="text-sm text-gray-500">{stage.deals.length}</span>
        </div>
        <div className="text-sm text-gray-600">
          Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
        </div>
      </div>
      
      {/* Área de Drop */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 min-h-[200px] p-3 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 shadow-lg' : 'bg-gray-50'
            }`}
          >
            {stage.deals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                index={index}
                stageId={stage.id}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});