import { MessageSquare, List, MousePointer, GitBranch } from 'lucide-react';
import type { NodeCategory } from '../types';

const MESSAGE_NODES = [
  {
    type: 'message-text',
    label: 'Mensagem de Texto',
    description: 'Envie mensagens de texto simples',
    icon: MessageSquare
  },
  {
    type: 'message-image',
    label: 'Mensagem com Imagem',
    description: 'Envie imagens com ou sem legenda',
    icon: MessageSquare
  },
  {
    type: 'message-video',
    label: 'Mensagem com Vídeo',
    description: 'Envie vídeos com ou sem legenda',
    icon: MessageSquare
  },
  {
    type: 'message-audio',
    label: 'Mensagem de Áudio',
    description: 'Envie mensagens de áudio',
    icon: MessageSquare
  },
  {
    type: 'message-file',
    label: 'Mensagem com Arquivo',
    description: 'Envie documentos e arquivos',
    icon: MessageSquare
  }
];

export const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: 'messages',
    label: 'Mensagens',
    icon: MessageSquare,
    description: 'Envie diferentes tipos de mensagens',
    color: 'blue',
    nodes: MESSAGE_NODES
  },
  {
    id: 'buttons',
    label: 'Botões',
    icon: MousePointer,
    description: 'Adicione interatividade com botões',
    color: 'green',
    nodes: [
      {
        type: 'button-action',
        label: 'Botão de Ação',
        description: 'Botão que executa uma ação ao ser clicado',
        icon: MousePointer
      },
      {
        type: 'button-list',
        label: 'Lista de Botões',
        description: 'Lista vertical de botões',
        icon: List
      },
      {
        type: 'button-quick-reply',
        label: 'Respostas Rápidas',
        description: 'Botões de resposta rápida abaixo da mensagem',
        icon: MousePointer
      }
    ]
  },
  {
    id: 'flow',
    label: 'Fluxo',
    icon: GitBranch,
    description: 'Controle o fluxo da conversa',
    color: 'purple',
    nodes: [
      {
        type: 'condition',
        label: 'Condição',
        description: 'Crie condições baseadas em variáveis',
        icon: GitBranch
      },
      {
        type: 'switch',
        label: 'Switch',
        description: 'Múltiplos caminhos baseados em valor',
        icon: GitBranch
      }
    ]
  }
];