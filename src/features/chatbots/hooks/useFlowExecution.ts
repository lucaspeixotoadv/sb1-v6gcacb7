import { useState, useCallback, useRef } from 'react';
import type { FlowExecutionState, FlowExecutionNode, FlowExecutionEdge } from '../types/flow';
import { FlowExecutor } from '../services/FlowExecutor';

export function useFlowExecution(
  nodes: FlowExecutionNode[], 
  edges: FlowExecutionEdge[]
) {
  const [state, setState] = useState<FlowExecutionState>({
    status: 'idle',
    currentNodeId: null,
    variables: {}
  });

  const executorRef = useRef<FlowExecutor>();

  const executeFlow = useCallback(async (startNodeId?: string) => {
    try {
      executorRef.current = new FlowExecutor(nodes, edges, {
        onNodeStart: (nodeId) => {
          setState(prev => ({
            ...prev,
            currentNodeId: nodeId
          }));
        },
        onNodeComplete: (nodeId, result) => {
          if (result.variables) {
            setState(prev => ({
              ...prev,
              variables: {
                ...prev.variables,
                ...result.variables
              }
            }));
          }
        },
        onFlowComplete: () => {
          setState(prev => ({
            ...prev,
            status: 'completed',
            currentNodeId: null
          }));
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: error.message
          }));
        },
        onVariableUpdate: (variables) => {
          setState(prev => ({
            ...prev,
            variables
          }));
        }
      });

      await executorRef.current.execute(startNodeId);
    } catch (error) {
      console.error('Erro na execução do fluxo:', error);
    }
  }, [nodes, edges]);

  const pauseFlow = useCallback(() => {
    executorRef.current?.pause();
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeFlow = useCallback(() => {
    executorRef.current?.resume();
    setState(prev => ({ ...prev, status: 'running' }));
  }, []);

  return {
    state,
    executeFlow,
    pauseFlow,
    resumeFlow
  };
}