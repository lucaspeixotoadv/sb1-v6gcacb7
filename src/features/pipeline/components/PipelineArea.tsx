import React from 'react';
import { PipelineTypeSelector } from './selectors/PipelineTypeSelector';
import { PipelineListSelector } from './selectors/PipelineListSelector';
import { PipelineBoard } from './board/PipelineBoard';
import { CreatePipelineModal } from './modals/CreatePipelineModal';
import { usePipelineContext } from '../context/PipelineContext';
import { usePipeline } from '../../../hooks/usePipeline';

export function PipelineArea() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showStageManager, setShowStageManager] = React.useState(false);
  
  const { 
    selectedType,
    setSelectedType,
    selectedPipelineId,
    setSelectedPipelineId,
    activePipeline
  } = usePipelineContext();

  const {
    pipelines,
    addPipeline,
    addDeal
  } = usePipeline();

  const filteredPipelines = React.useMemo(() => {
    if (!selectedType) return [];
    return pipelines.filter(p => p.type === selectedType);
  }, [pipelines, selectedType]);

  // Step 1: Select Pipeline Type
  if (!selectedType) {
    return <PipelineTypeSelector onSelectType={setSelectedType} />;
  }

  // Step 2: Select Specific Pipeline
  if (!selectedPipelineId) {
    return (
      <>
        <PipelineListSelector
          type={selectedType}
          pipelines={filteredPipelines}
          onSelectPipeline={setSelectedPipelineId}
          onCreatePipeline={() => setShowCreateModal(true)}
          onBack={() => setSelectedType(null)}
        />

        <CreatePipelineModal
          type={selectedType}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={({ name, stages }) => {
            addPipeline(name, selectedType, stages);
            setShowCreateModal(false);
          }}
        />
      </>
    );
  }

  // Step 3: Show Pipeline Board
  if (!activePipeline) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Pipeline não encontrado</p>
      </div>
    );
  }

  return (
    <PipelineBoard
      pipeline={activePipeline}
      pipelines={filteredPipelines}
      onAddDeal={() => {
        addDeal({
          title: 'Nova Oportunidade',
          value: 0,
          stage: activePipeline.stages[0].id,
          priority: 'medium',
          status: 'active',
          tags: [],
          customFields: {}
        });
      }}
      onManageStages={() => setShowStageManager(true)}
      onBack={() => setSelectedPipelineId(null)}
      onChangePipeline={setSelectedPipelineId}
    />
  );
}