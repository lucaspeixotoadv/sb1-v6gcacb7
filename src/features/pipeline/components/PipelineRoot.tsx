import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { PipelineTypeSelector } from './selectors/PipelineTypeSelector';
import { PipelineListSelector } from './selectors/PipelineListSelector';
import { PipelineBoard } from './board/PipelineBoard';
import { CreatePipelineModal } from './modals/CreatePipelineModal';
import { StageManager } from './modals/StageManager';
import { usePipelineContext } from '../context/PipelineContext';
import { usePipeline } from '../../../hooks/usePipeline';
import type { Pipeline } from '../types';

export function PipelineRoot() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  
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
    updatePipelineStages
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
    <>
      <PipelineBoard
        pipeline={activePipeline}
        pipelines={filteredPipelines}
        onManageStages={() => setShowStageManager(true)}
        onBack={() => setSelectedPipelineId(null)}
        onChangePipeline={setSelectedPipelineId}
      />

      {showStageManager && (
        <StageManager
          pipeline={activePipeline}
          onClose={() => setShowStageManager(false)}
          onUpdateStages={(stages) => {
            updatePipelineStages(activePipeline.id, stages);
            setShowStageManager(false);
          }}
        />
      )}
    </>
  );
}