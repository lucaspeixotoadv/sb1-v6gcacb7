import React from 'react';
import { MessageSquare, Image, Video, FileText, Zap, GitBranch, MousePointer } from 'lucide-react';

const NODE_CATEGORIES = [
  {
    id: 'messages',
    label: 'Mensagens',
    description: 'Envie diferentes tipos de mensagens',
    icon: MessageSquare,
    color: 'blue',
    nodes: [
      { type: 'message-text', label: 'Texto', description: 'Mensagem de texto simples', icon: MessageSquare },
      { type: 'message-image', label: 'Imagem', description: 'Mensagem com imagem', icon: Image },
      { type: 'message-video', label: 'Vídeo', description: 'Mensagem com vídeo', icon: Video },
      { type: 'message-file', label: 'Arquivo', description: 'Mensagem com arquivo', icon: FileText }
    ]
  },
  {
    id: 'actions',
    label: 'Ações',
    description: 'Execute ações no fluxo',
    icon: Zap,
    color: 'purple',
    nodes: [
      { type: 'action-tag', label: 'Adicionar Tag', description: 'Adiciona uma tag ao contato', icon: Zap },
      { type: 'action-field', label: 'Atualizar Campo', description: 'Atualiza um campo do contato', icon: Zap }
    ]
  },
  {
    id: 'flow',
    label: 'Fluxo',
    description: 'Controle o fluxo da conversa',
    icon: GitBranch,
    color: 'green',
    nodes: [
      { type: 'condition', label: 'Condição', description: 'Bifurca o fluxo baseado em condição', icon: GitBranch },
      { type: 'switch', label: 'Switch', description: 'Múltiplos caminhos baseados em valor', icon: GitBranch }
    ]
  },
  {
    id: 'buttons',
    label: 'Botões',
    description: 'Adicione interatividade',
    icon: MousePointer,
    color: 'orange',
    nodes: [
      { type: 'button-list', label: 'Lista de Botões', description: 'Lista vertical de botões', icon: MousePointer },
      { type: 'button-quick', label: 'Respostas Rápidas', description: 'Botões de resposta rápida', icon: MousePointer }
    ]
  }
];

interface FlowToolbarProps {
  onAddNode: (type: string) => void;
}

export function FlowToolbar({ onAddNode }: FlowToolbarProps) {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  return (
    <div className="w-64 bg-white border-l overflow-y-auto">
      <div className="p-2 border-b">
        <h3 className="text-xs font-medium text-gray-600">Adicionar Nó</h3>
      </div>
      
      <div className="p-1.5 space-y-1">
        {NODE_CATEGORIES.map(category => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className={`
                  w-full p-2 flex items-center gap-2 text-left transition-colors
                  ${isExpanded ? 'bg-gray-100' : 'hover:bg-gray-50'}
                `}
              >
                <Icon size={18} className={isExpanded ? 'text-blue-500' : 'text-gray-400'} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{category.label}</div>
                  <div className="text-xs text-gray-500">{category.description}</div>
                </div>
              </button>

              {isExpanded && (
                <div className="py-1 px-2 bg-gray-50 border-t border-b">
                  {category.nodes.map(node => {
                    const NodeIcon = node.icon;
                    return (
                      <button
                        key={node.type}
                        onClick={() => onAddNode(node.type)}
                        className="w-full p-2 text-left hover:bg-white rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">{node.label}</div>
                            <div className="text-xs text-gray-500">{node.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}