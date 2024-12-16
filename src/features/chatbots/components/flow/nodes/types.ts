// messages/types.ts
export interface MessageConfig {
  content: string;
  delay: number;
  typing?: boolean;
  waitForResponse?: {
    variableName: string;
    required?: boolean;
    timeout?: {
      enabled: boolean;
      value: number;
      unit: 'seconds' | 'minutes' | 'hours';
      message?: string;
      retryEnabled?: boolean;
      maxRetries?: number;
      retryDelay?: number;
    };
  };
}

export type NodeData = {
  type: 'text' | 'image' | 'video' | 'file';
  config: MessageConfig;
};