import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { CreatePipelineCategoryModal } from '../modals/CreatePipelineCategoryModal';
import { PipelineTypeCard } from './PipelineTypeCard';
import type { PipelineTypeConfig } from '../../types';

interface CustomPipelineCategoriesProps {
  onSelectCategory: (categoryId: string) => void;
  onBack: () => void;
}

export function CustomPipelineCategories({ onSelectCategory, onBack }: CustomPipelineCategoriesProps) {
  const [categories, setCategories] = React.useState<PipelineTypeConfig[]>([]);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const handleCreateCategory = (category: PipelineTypeConfig) => {
    setCategories(prev => [...prev, category]);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100"
        >
          Voltar
        </button>
        <h2 className="text-2xl font-semibold">Categorias de Pipeline</h2>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow border-dashed border-gray-300 group"
        >
          <div className="p-3 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 mr-4">
            <Plus size={24} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center">
              Nova Categoria de Pipeline
              <ChevronRight 
                size={16} 
                className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" 
              />
            </h3>
            <p className="text-sm text-gray-500">
              Crie uma nova categoria para organizar seus pipelines personalizados
            </p>
          </div>
        </button>

        {categories.map((category) => (
          <PipelineTypeCard
            key={category.id}
            type={category}
            onSelect={() => onSelectCategory(category.id)}
            isEditable={true}
          />
        ))}
      </div>

      <CreatePipelineCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCategory}
      />
    </div>
  );
}