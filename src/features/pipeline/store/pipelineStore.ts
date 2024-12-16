import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { Pipeline, Stage, Deal } from '../types';

interface PipelineState {
  pipelines: Pipeline[];
  activePipelineId: string | null;
  addPipeline: (name: string, type: Pipeline['type'], stages: { name: string }[]) => void;
  updatePipelineStages: (pipelineId: string, stages: Stage[]) => void;
  moveDeal: (dealId: string, targetStageId: string) => void;
  addDeal: (stageId: string, dealData: Partial<Deal>) => Deal | null;
  setActivePipelineId: (id: string | null) => void;
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set) => ({
      pipelines: [],
      activePipelineId: null,

      addPipeline: (name, type, stages) => set(produce((state) => {
        const newPipeline: Pipeline = {
          id: uuidv4(),
          name,
          type,
          color: '#4F46E5',
          stages: stages.map((stage, index) => ({
            id: `stage-${uuidv4()}`,
            name: stage.name,
            order: index,
            color: '#E5E7EB',
            deals: []
          }))
        };
        state.pipelines.push(newPipeline);
        state.activePipelineId = newPipeline.id;
      })),

      updatePipelineStages: (pipelineId, stages) => set(produce((state) => {
        const pipeline = state.pipelines.find(p => p.id === pipelineId);
        if (pipeline) {
          pipeline.stages = stages;
        }
      })),

      moveDeal: (dealId, targetStageId) => set(produce((state) => {
        const activePipeline = state.pipelines.find(p => p.id === state.activePipelineId);
        if (!activePipeline) return;

        let dealToMove: Deal | undefined;
        let sourceStageId: string | undefined;

        // Find the deal and its current stage
        for (const stage of activePipeline.stages) {
          const deal = stage.deals.find(d => d.id === dealId);
          if (deal) {
            dealToMove = deal;
            sourceStageId = stage.id;
            break;
          }
        }

        if (!dealToMove || !sourceStageId) return;

        // Remove from source stage
        const sourceStage = activePipeline.stages.find(s => s.id === sourceStageId);
        if (sourceStage) {
          sourceStage.deals = sourceStage.deals.filter(d => d.id !== dealId);
        }

        // Add to target stage
        const targetStage = activePipeline.stages.find(s => s.id === targetStageId);
        if (targetStage) {
          dealToMove.stage = targetStageId;
          dealToMove.updatedAt = new Date();
          targetStage.deals.push(dealToMove);
        }
      })),

      addDeal: (stageId, dealData) => set(produce((state) => {
        const activePipeline = state.pipelines.find(p => p.id === state.activePipelineId);
        if (!activePipeline || !activePipeline.stages.length) {
          console.error('Pipeline não encontrado ou sem estágios');
          return null;
        }
        
        const targetStage = activePipeline.stages.find(s => s.id === stageId) || activePipeline.stages[0];
        if (!targetStage) {
          console.error('Estágio não encontrado');
          return null;
        }
        
        const newDeal: Deal = {
          id: `deal-${uuidv4()}`,
          title: dealData.title || 'Nova Oportunidade',
          value: typeof dealData.value === 'number' ? dealData.value : 0,
          contactId: dealData.contactId,
          stage: targetStage.id,
          priority: dealData.priority || 'medium',
          status: dealData.status || 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: dealData.tags || [],
          customFields: dealData.customFields || {},
          description: dealData.description,
          dueDate: dealData.dueDate
        };

        targetStage.deals.push(newDeal);
        return newDeal;
      })),

      setActivePipelineId: (id) => set({ activePipelineId: id })
    }),
    {
      name: 'pipeline-storage',
      partialize: (state) => ({
        pipelines: state.pipelines,
        activePipelineId: state.activePipelineId
      })
    }
  )
);