import { useState, useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { usePipeline } from '../../../hooks/usePipeline';

export function usePipelineBoard() {
  const [showFilters, setShowFilters] = useState(false);
  const { moveDeal } = usePipeline();

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { draggableId: dealId, source, destination } = result;
    
    if (source.droppableId !== destination.droppableId) {
      moveDeal(dealId, destination.droppableId);
    }
  }, [moveDeal]);

  return {
    showFilters,
    toggleFilters,
    handleDragEnd
  };
}