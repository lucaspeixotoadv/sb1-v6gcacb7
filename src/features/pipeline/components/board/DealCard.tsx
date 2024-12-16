import React, { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, DollarSign, Tag } from 'lucide-react';
import type { Deal } from '../../types';

interface DealCardProps {
  deal: Deal;
  index: number;
  stageId: string;
}

export const DealCard = memo(function DealCard({ deal, index, stageId }: DealCardProps) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style
          }}
          className={`relative bg-white rounded-lg shadow-sm border p-4 transition-shadow duration-200 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 truncate flex-1">{deal.title}</h4>
          </div>

          <div className="mb-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                deal.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : deal.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {deal.priority === 'high'
                ? 'Alta'
                : deal.priority === 'medium'
                ? 'Média'
                : 'Baixa'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(deal.value)}
              </span>
            </div>

            {deal.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(deal.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {deal.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {deal.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});