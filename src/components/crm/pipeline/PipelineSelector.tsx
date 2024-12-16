import React from 'react';
import { Building2, HeadphonesIcon, Briefcase, ChevronRight } from 'lucide-react';
import type { Pipeline } from '../../../types';

interface PipelineSelectorProps {
  onSelectType: (type: Pipeline['type']) => void;
}

const PIPELINE_TYPES = [
  {
    type: 'sales' as const,
    name: 'Pipeline Comercial',
    description: 'Gerencie suas oportunidades de vendas e negócios',
    icon: Briefcase,
    color: 'bg-blue-500'
  },
  {
    type: 'support' as const,
    name: 'Pipeline de Suporte',
    description: 'Acompanhe tickets e atendimentos ao cliente',
    icon: HeadphonesIcon,
    color: 'bg-green-500'
  },
  {
    type: 'custom' as const,
    name: 'Pipeline Personalizado',
    description: 'Crie pipelines customizados para suas necessidades',
    icon: Building2,
    color: 'bg-purple-500'
  }
];

export function PipelineSelector({ onSelectType }: PipelineSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-8">Selecione o Tipo de Pipeline</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PIPELINE_TYPES.map(({ type, name, description, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onSelectType(type)}
            className="flex items-start p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className={`p-3 rounded-lg ${color} text-white mr-4`}>
              <Icon size={24} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 mb-1 flex items-center">
                {name}
                <ChevronRight 
                  size={16} 
                  className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" 
                />
              </h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}