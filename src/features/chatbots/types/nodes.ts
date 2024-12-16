import type { Node, NodeProps } from 'reactflow';

export interface BaseNodeData {
  id: string;
  label?: string;
  description?: string;
}

export interface NodeResponse {
  variableName: string;
  required: boolean;
  timeout?: {
    enabled: boolean;
    value: number;
    unit: 'seconds' | 'minutes' | 'hours';
    message?: string;
    retryEnabled?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  };
}

export interface TextNodeData extends BaseNodeData {
  content: string;
  waitForResponse?: NodeResponse;
}

export interface TimeoutConfig {
  enabled: boolean;
  path?: string;
  actions?: string[];
  logToAnalytics?: boolean;
  variables?: Record<string, string>;
}

export interface NodeValidation {
  isValid: boolean;
  errors: string[];
}