import React, { createContext, useContext, useState } from 'react';
import { usePipelineStore } from '../store/pipelineStore';
import type { Pipeline } from '../types';

interface PipelineContextData {
  selectedType: Pipeline['type'] | null;
  selectedPipelineId: string | null;
  setSelectedType: (type: Pipeline['type'] | null) => void;
  setSelectedPipelineId: (id: string | null) => void;
  activePipeline: Pipeline | null;
}

const PipelineContext = createContext<PipelineContextData | undefined>(undefined);

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [selectedType, setSelectedType] = useState<Pipeline['type'] | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const { pipelines, activePipelineId } = usePipelineStore();

  const activePipeline = selectedPipelineId 
    ? pipelines.find(p => p.id === selectedPipelineId)
    : null;

  const value = {
    selectedType,
    selectedPipelineId,
    setSelectedType,
    setSelectedPipelineId,
    activePipeline
  };

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipelineContext() {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipelineContext must be used within a PipelineProvider');
  }
  return context;
}