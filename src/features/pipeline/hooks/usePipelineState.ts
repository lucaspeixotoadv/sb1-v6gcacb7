import { useState, useCallback, useEffect } from 'react';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { usePipelineStorage } from './usePipelineStorage';
import type { Pipeline, Stage, Deal } from '../types';
import type { DropResult } from '@hello-pangea/dnd';

const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Pipeline]', ...args);
  }
};

const createInitialPipeline = (): Pipeline => ({
  id: '1',
  name: 'Pipeline de Vendas',
  type: 'sales',
  color: '#4F46E5',
  stages: [
    {
      id: 'stage-1',
      name: 'Prospecção',
      order: 0,
      color: '#E5E7EB',
      deals: [
        {
          id: 'deal-1',
          title: 'Novo Projeto',
          value: 50000,
          contactId: '1',
          stage: 'stage-1',
          priority: 'high',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['Novo'],
          customFields: {}
        }
      ]
    },
    {
      id: 'stage-2',
      name: 'Qualificação',
      order: 1,
      color: '#E5E7EB',
      deals: []
    },
    {
      id: 'stage-3',
      name: 'Proposta',
      order: 2,
      color: '#E5E7EB',
      deals: []
    }
  ]
});

export function usePipelineState() {
  const { savePipelines, loadPipelines } = usePipelineStorage();
  const [pipelines, setPipelines] = useState<Pipeline[]>(() => {
    const loaded = loadPipelines();
    return loaded.length > 0 ? loaded : [createInitialPipeline()];
  });
  const [activePipelineId, setActivePipelineId] = useState<string>(pipelines[0].id);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const updatePipelineStages = useCallback((pipelineId: string, newStages: Stage[]) => {
    log('Atualizando estágios do pipeline:', { pipelineId, newStages });
    setPipelines(prevPipelines =>
      prevPipelines.map(pipeline =>
        pipeline.id === pipelineId
          ? { ...pipeline, stages: newStages }
          : pipeline
      )
    );
  }, []);

  const activePipeline = pipelines.find(p => p.id === activePipelineId);

  // Garantir que o estado inicial está carregado antes de permitir drag and drop
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    log('Salvando estado dos pipelines:', pipelines);
    savePipelines(pipelines);
  }, [pipelines, savePipelines]);

  const handleDragStart = useCallback(() => {
    log('Iniciando drag');
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    log('Finalizando drag', result);
    setIsDragging(false);

    const { destination, source, draggableId } = result;
    
    if (!destination || !activePipeline) {
      log('Drag cancelado - sem destino ou pipeline');
      return;
    }
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      log('Drag cancelado - mesma posição');
      return;
    }
    
    setPipelines(prevPipelines => {
      const updatedPipelines = prevPipelines.map(pipeline => {
        if (pipeline.id !== activePipelineId) {
          return pipeline;
        }
        
        return produce(pipeline, draft => {
          const sourceStage = draft.stages.find(s => s.id === source.droppableId);
          const destStage = draft.stages.find(s => s.id === destination.droppableId);
          
          if (!sourceStage || !destStage) {
            log('Drag cancelado - estágio não encontrado');
            return;
          }
          
          const [movedDeal] = sourceStage.deals.splice(source.index, 1);
          movedDeal.stage = destination.droppableId;
          movedDeal.updatedAt = new Date();
          
          destStage.deals.splice(destination.index, 0, movedDeal);
        });
      });

      return updatedPipelines;
    });
  }, [activePipeline, activePipelineId]);

  const addDeal = useCallback((stageId: string, deal: Partial<Deal>) => {
    log('Adicionando novo deal', { stageId, deal });
    const newDeal: Deal = {
      id: `deal-${uuidv4()}`,
      title: deal.title || 'Nova Oportunidade',
      value: deal.value || 0,
      contactId: deal.contactId || '',
      stage: stageId,
      priority: deal.priority || 'medium',
      status: deal.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: deal.tags || [],
      customFields: deal.customFields || {},
      ...deal
    };

    setPipelines(prevPipelines =>
      prevPipelines.map(pipeline => {
        if (pipeline.id !== activePipelineId) {
          return pipeline;
        }

        return {
          ...pipeline,
          stages: pipeline.stages.map(stage => {
            if (stage.id === stageId) {
              return {
                ...stage,
                deals: [...stage.deals, newDeal]
              };
            }
            return stage;
          })
        };
      })
    );

    return newDeal;
  }, [activePipelineId]);

  return {
    pipelines,
    activePipeline,
    setActivePipelineId,
    handleDragStart,
    handleDragEnd,
    updatePipelineStages,
    addDeal,
    isDragging,
    isReady
  };
}