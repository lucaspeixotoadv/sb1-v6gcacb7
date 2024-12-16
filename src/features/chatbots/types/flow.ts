import type { Node, Edge } from 'reactflow';
import type { TextNodeData } from './nodes';

export type FlowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export interface FlowExecutionNode extends Node {
  data: TextNodeData;
}

export interface FlowExecutionEdge extends Edge {
  source: string;
  target: string;
}

export interface FlowExecutionState {
  status: FlowStatus;
  currentNodeId: string | null;
  variables: Record<string, any>;
  error?: string;
}

export interface FlowExecutionContext {
  variables: Record<string, any>;
  getNextNodes: (nodeId: string) => FlowExecutionNode[];
  updateVariable: (name: string, value: any) => void;
}

export interface NodeExecutionResult {
  success: boolean;
  error?: string;
  variables?: Record<string, any>;
}

export interface FlowExecutionOptions {
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, result: NodeExecutionResult) => void;
  onFlowComplete?: () => void;
  onError?: (error: Error) => void;
  onVariableUpdate?: (variables: Record<string, any>) => void;
}