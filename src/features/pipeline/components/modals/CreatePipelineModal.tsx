import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { AVAILABLE_ICONS } from '../../constants/icons';
import { AVAILABLE_COLORS } from '../../constants/colors';
import { Button } from '@/components/ui/Button';
import type { Pipeline, PipelineTypeConfig } from '../../types';

interface CreatePipelineModalProps {
  type: Pipeline['type'];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    icon: PipelineTypeConfig['icon'];
    color: string;
    stages: { name: string }[];
  }) => void;
}

const DEFAULT_STAGES = {
  sales: [
    { name: 'Lead Recebido' },
    { name: 'Primeiro Contato' },
    { name: 'Qualificação' },
    { name: 'Proposta' },
    { name: 'Negociação' },
    { name: 'Fechado' }
  ],
  support: [
    { name: 'Novo Cliente' },
    { name: 'Em Atendimento' },
    { name: 'Fidelização' },
    { name: 'Renovação' }
  ],
  custom: [
    { name: 'Nova Fase' }
  ]
};

export function CreatePipelineModal({ type, isOpen, onClose, onSubmit }: CreatePipelineModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: AVAILABLE_ICONS[0],
    color: AVAILABLE_COLORS[0],
    stages: DEFAULT_STAGES[type]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      icon: AVAILABLE_ICONS[0],
      color: AVAILABLE_COLORS[0],
      stages: DEFAULT_STAGES[type]
    });
    onClose();
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, { name: '' }]
    }));
  };

  const removeStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const updateStageName = (index: number, name: string) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, name } : stage
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Criar Novo Pipeline</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure as características e etapas do seu pipeline
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Pipeline
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: Pipeline de Vendas Enterprise"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Descreva o propósito deste pipeline..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map((IconComponent, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: IconComponent }))}
                      className={`p-2 rounded-lg border ${
                        formData.icon === IconComponent ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Pipeline
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full ${color} ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Etapas do Pipeline
                </label>
                <button
                  type="button"
                  onClick={addStage}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Adicionar Etapa
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {formData.stages.map((stage, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="w-6 text-sm text-gray-400 pt-2 text-center">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStageName(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Nome da etapa"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeStage(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={20} />
              Criar Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}