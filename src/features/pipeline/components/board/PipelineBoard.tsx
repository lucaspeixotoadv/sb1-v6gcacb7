import React from 'react';
import { StageColumn } from './StageColumn';
import { PipelineHeader } from './PipelineHeader';
import { PipelineFilters } from './PipelineFilters';
import { DealFormModal } from '../modals/DealFormModal';
import type { Pipeline, Deal } from '../../../../types';
import { usePipelineStore } from '../../store/pipelineStore';

interface PipelineBoardProps {
  pipeline: Pipeline;
  pipelines: Pipeline[];
  isDragging?: boolean;
  onManageStages: () => void;
  onBack: () => void;
  onChangePipeline: (id: string) => void;
}

export function PipelineBoard({ 
  pipeline, 
  pipelines,
  isDragging,
  onManageStages,
  onBack,
  onChangePipeline
}: PipelineBoardProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showDealModal, setShowDealModal] = React.useState(false);
  const { addDeal } = usePipelineStore();

  const handleAddDeal = (dealData: Partial<Deal>) => {
    try {
      const newDeal = addDeal(pipeline.stages[0].id, {
        ...dealData
      });
      
      if (newDeal) {
        setShowDealModal(false);
      } else {
        throw new Error('Não foi possível criar a oportunidade');
      }
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      alert('Erro ao criar oportunidade: Verifique se todos os campos obrigatórios foram preenchidos.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PipelineHeader
        pipeline={pipeline}
        pipelines={pipelines}
        onAddDeal={() => {
          setShowDealModal(true);
        }}
        onManageStages={onManageStages}
        onBack={onBack}
        onChangePipeline={onChangePipeline}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        showFilters={showFilters}
      />

      {showFilters && <PipelineFilters />}

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
          {pipeline.stages.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
            />
          ))}
        </div>
      </div>

      <DealFormModal
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        onSubmit={handleAddDeal}
        initialStageId={pipeline.stages[0]?.id}
      />
    </div>
  );
}