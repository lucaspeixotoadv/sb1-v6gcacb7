import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, X, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { v4 as uuidv4 } from 'uuid';
import type { Pipeline, Stage } from '../../types';

interface StageManagerProps {
  pipeline: Pipeline;
  onClose: () => void;
  onUpdateStages: (stages: Stage[]) => void;
}

export function StageManager({ pipeline, onClose, onUpdateStages }: StageManagerProps) {
  const [stages, setStages] = React.useState<Stage[]>(pipeline.stages);
  const [newStageName, setNewStageName] = useState('');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStageName.trim()) {
      const newStage: Stage = {
        id: `stage-${uuidv4()}`,
        name: newStageName.trim(),
        order: stages.length,
        color: '#E5E7EB',
        deals: []
      };
      setStages(prev => [...prev, newStage]);
      setNewStageName('');
    }
  };

  const handleUpdateStage = (stageId: string) => {
    if (editingName.trim()) {
      setStages(prev =>
        prev.map(stage =>
          stage.id === stageId
            ? { ...stage, name: editingName.trim() }
            : stage
        )
      );
      setEditingStageId(null);
      setEditingName('');
    }
  };

  const handleDeleteStage = (stageId: string) => {
    const stage = pipeline.stages.find(s => s.id === stageId);
    if (!stage) return;

    if (stage.deals.length === 0 || 
        window.confirm('Esta fase contém oportunidades. Deseja realmente excluí-la?')) {
      setStages(prev => prev.filter(s => s.id !== stageId));
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedStages = items.map((stage, index) => ({
      ...stage,
      order: index
    }));
    
    setStages(reorderedStages);
  };

  const handleSaveChanges = () => {
    onUpdateStages(stages);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Gerenciar Etapas do Pipeline</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAddStage} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Nome da nova etapa..."
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              type="submit"
              disabled={!newStageName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={20} />
              Adicionar
            </button>
          </form>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stages">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {stages.map((stage, index) => (
                    <Draggable
                      key={stage.id}
                      draggableId={stage.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 hover:text-gray-600 cursor-grab"
                          >
                            <GripVertical size={20} />
                          </div>
                          
                          {editingStageId === stage.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1 px-2 py-1 border rounded"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateStage(stage.id)}
                                className="p-1 text-green-600 hover:text-green-700"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingStageId(null)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1">{stage.name}</span>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingStageId(stage.id);
                                    setEditingName(stage.name);
                                  }}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteStage(stage.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}