import { useCallback } from 'react';
import type { Pipeline, Stage, Deal } from '../types';

const STORAGE_KEY = 'pipeline_state_v2';

export function usePipelineStorage() {
  const savePipelines = useCallback((pipelines: Pipeline[]) => {
    try {
      console.log('Salvando pipelines:', pipelines);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelines));
    } catch (error) {
      console.error('Erro ao salvar estado do pipeline:', error);
    }
  }, []);

  const loadPipelines = useCallback((): Pipeline[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converte as datas de string para Date
        return parsed.map((pipeline: Pipeline) => ({
          ...pipeline,
          stages: pipeline.stages.map((stage: Stage) => ({
            ...stage,
            deals: stage.deals.map((deal: Deal) => ({
              ...deal,
              createdAt: new Date(deal.createdAt),
              updatedAt: new Date(deal.updatedAt),
              dueDate: deal.dueDate ? new Date(deal.dueDate) : undefined
            }))
          }))
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar estado do pipeline:', error);
    }
    return [];
  }, []);

  return {
    savePipelines,
    loadPipelines
  };
}