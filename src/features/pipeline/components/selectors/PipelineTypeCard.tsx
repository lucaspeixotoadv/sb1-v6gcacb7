import React from 'react';
import { Edit2, ChevronRight } from 'lucide-react';
import type { PipelineType } from '../../types';

interface PipelineTypeCardProps {
  type: PipelineType;
  onSelect: () => void;
  onEdit?: () => void;
  isEditable?: boolean;
}

export function PipelineTypeCard({ type, onSelect, onEdit, isEditable }: PipelineTypeCardProps) {
  const Icon = type.icon;
  
  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className="w-full flex items-start p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all text-left"
      >
        <div className={`p-3 rounded-lg ${type.color} text-white mr-4`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1 flex items-center group-hover:text-gray-700">
            {type.name}
            <ChevronRight 
              size={16} 
              className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" 
            />
          </h3>
          <p className="text-sm text-gray-500">{type.description}</p>
        </div>
      </button>
      
      {isEditable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          title="Editar tipo de pipeline"
        >
          <Edit2 size={16} className="text-gray-500" />
        </button>
      )}
    </div>
  );
}