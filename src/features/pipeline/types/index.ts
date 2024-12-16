import { LucideIcon } from 'lucide-react';

// Adicione estas interfaces ao arquivo de tipos existente
export interface PipelineTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  isEditable?: boolean;
}

export type PipelineType = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
};