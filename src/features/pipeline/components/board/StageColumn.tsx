import React, { memo } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { DealCard } from './DealCard';
import { StageHeader } from './StageHeader';
import type { Stage } from '../../types';

interface StageColumnProps {
  stage: Stage;
}

export const StageColumn = memo(function StageColumn({ stage }: StageColumnProps) {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-lg p-4">
      <StageHeader stage={stage} />
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...provided.droppableProps.style,
              minHeight: 200
            }}
            className={`flex-1 space-y-3 min-h-[200px] p-3 rounded-lg transition-all duration-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 shadow-lg' : ''
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