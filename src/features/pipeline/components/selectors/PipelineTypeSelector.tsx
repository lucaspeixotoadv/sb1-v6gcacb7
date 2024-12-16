import React from 'react';
import { Building2, HeadphonesIcon, Briefcase, Plus } from 'lucide-react';
import { PipelineTypeCard } from './PipelineTypeCard';
import { EditPipelineTypeModal } from './EditPipelineTypeModal';
import { CreatePipelineCategoryModal } from '../modals/CreatePipelineCategoryModal';
import type { Pipeline, PipelineTypeConfig } from '../../types';

interface PipelineTypeSelectorProps {
  onSelectType: (type: Pipeline['type']) => void;
}

const DEFAULT_TYPES: PipelineTypeConfig[] = [
  {
    id: 'sales',
    name: 'Pipeline de Leads',
    description: 'Gerencie seus leads e oportunidades de vendas',
    icon: Briefcase,
    color: 'bg-blue-500',
    isEditable: true
  },
  {
    id: 'support',
    name: 'Pipeline de Clientes',
    description: 'Acompanhe e gerencie seus clientes ativos',
    icon: HeadphonesIcon,
    color: 'bg-green-500',
    isEditable: true
  }
];

export function PipelineTypeSelector({ onSelectType }: PipelineTypeSelectorProps) {
  const [types, setTypes] = React.useState(DEFAULT_TYPES);
  const [customCategories, setCustomCategories] = React.useState<PipelineTypeConfig[]>([]);
  const [editingType, setEditingType] = React.useState<PipelineTypeConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const handleSaveType = (config: PipelineTypeConfig) => {
    setTypes(prev => 
      prev.map(type => 
        type.id === config.id ? config : type
      )
    );
    setEditingType(null);
  };

  const handleCreateCategory = (category: PipelineTypeConfig) => {
    setCustomCategories(prev => [...prev, category]);
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-8">Selecione o Tipo de Pipeline</h2>
      
      <div className="space-y-8">
        {/* Pipelines Padrão */}
        <div className="grid md:grid-cols-2 gap-6">
          {types.map((type) => (
            <PipelineTypeCard
              key={type.id}
              type={type}
              onSelect={() => onSelectType(type.id as Pipeline['type'])}
              onEdit={() => setEditingType(type)}
              isEditable={type.isEditable}
            />
          ))}
        </div>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gray-50 text-sm text-gray-500">
              Pipelines Personalizados
            </span>
          </div>
        </div>

        {/* Categorias Personalizadas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Botão Criar Nova Categoria */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow border-dashed border-gray-300 group h-full"
          >
            <div className="p-3 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 mr-4">
              <Plus size={24} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 mb-1">
                Nova Categoria
              </h3>
              <p className="text-sm text-gray-500">
                Crie uma categoria personalizada de pipeline
              </p>
            </div>
          </button>

          {/* Lista de Categorias Personalizadas */}
          {customCategories.map((category) => (
            <PipelineTypeCard
              key={category.id}
              type={category}
              onSelect={() => onSelectType(category.id as Pipeline['type'])}
              isEditable={true}
            />
          ))}
        </div>
      </div>

      {/* Modais */}
      {editingType && (
        <EditPipelineTypeModal
          isOpen={true}
          config={editingType}
          onClose={() => setEditingType(null)}
          onSave={handleSaveType}
        />
      )}

      <CreatePipelineCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCategory}
      />
    </div>
  );
}