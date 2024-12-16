import React from 'react';
import { MessageSquare, Instagram, Facebook, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import type { Chatbot } from '../../../../features/automation/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatbotListProps {
  chatbots: Chatbot[];
  onSelectChatbot: (id: string) => void;
  onEditChatbot: (chatbot: Chatbot) => void;
  onDeleteChatbot: (id: string) => void;
}

interface ChannelGroup {
  id: Chatbot['channel'];
  name: string;
  icon: typeof MessageSquare;
  color: string;
  groups: ChatbotGroup[];
  chatbots: Chatbot[];
}

interface ChatbotGroup {
  id: string;
  name: string;
  chatbots: Chatbot[];
}

const CHANNEL_ICONS = {
  whatsapp: MessageSquare,
  instagram: Instagram,
  facebook: Facebook
};

const CHANNEL_COLORS = {
  whatsapp: 'bg-green-500',
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-500'
};

const CHANNEL_NAMES = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook'
};

interface ChatbotItemProps {
  chatbot: Chatbot;
  onSelect: (id: string) => void;
  onEdit: (chatbot: Chatbot) => void;
  onDelete: () => void;
}

function ChatbotItem({ chatbot, onSelect, onEdit, onDelete }: ChatbotItemProps) {
  return (
    <div className="w-full p-4 hover:bg-gray-50 group">
      <div className="flex items-start justify-between">
        {/* Lado esquerdo - Informações do chatbot */}
        <div className="flex-1" onClick={() => onSelect(chatbot.id)} role="button">
          <h4 className="font-medium text-gray-900">{chatbot.name}</h4>
          {chatbot.description && (
            <p className="text-sm text-gray-500 mt-1">
              {chatbot.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>
              Criado em {new Date(chatbot.createdAt).toLocaleDateString()}
            </span>
            <span>
              Atualizado em {new Date(chatbot.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Lado direito - Status e botões de ação */}
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 text-xs rounded-full
            ${chatbot.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : chatbot.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
            }
          `}>
            {chatbot.status === 'active' ? 'Ativo' 
              : chatbot.status === 'draft' ? 'Rascunho' 
              : 'Inativo'}
          </span>
          
          <button
            onClick={() => onEdit(chatbot)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            <Edit2 size={16} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatbotList({ chatbots, onSelectChatbot, onEditChatbot, onDeleteChatbot }: ChatbotListProps) {
  const [expandedChannels, setExpandedChannels] = React.useState<Set<string>>(new Set(['whatsapp']));
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const [chatbotToDelete, setChatbotToDelete] = React.useState<Chatbot | null>(null);

  const chatbotsByChannel = React.useMemo(() => {
    const groups: ChannelGroup[] = [
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: MessageSquare,
        color: 'bg-green-500',
        chatbots: [],
        groups: [
          { id: 'atendimento', name: 'Atendimento', chatbots: [] },
          { id: 'vendas', name: 'Vendas', chatbots: [] },
          { id: 'suporte', name: 'Suporte', chatbots: [] },
          { id: 'marketing', name: 'Marketing', chatbots: [] }
        ]
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        color: 'bg-pink-500',
        chatbots: [],
        groups: []
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: Facebook,
        color: 'bg-blue-500',
        chatbots: [],
        groups: []
      }
    ];

    chatbots.forEach(chatbot => {
      const group = groups.find(g => g.id === chatbot.channel);
      if (group) {
        const subgroup = group.groups.find(g => chatbot.group === g.id);
        if (subgroup) {
          subgroup.chatbots.push(chatbot);
        } else {
          group.chatbots.push(chatbot);
        }
      }
    });

    return groups;
  }, [chatbots]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  if (chatbots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Nenhum chatbot configurado
        </h3>
        <p className="text-sm text-gray-500">
          Clique no botão acima para criar seu primeiro chatbot
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {chatbotsByChannel.map((group) => {
        const Icon = group.icon;
        const isExpanded = expandedChannels.has(group.id);
        const hasItems = group.chatbots.length > 0 || group.groups.some(g => g.chatbots.length > 0);

        return (
          <div key={group.id} className="bg-white rounded-lg border">
            <button
              onClick={() => {
                setExpandedChannels(prev => {
                  const next = new Set(prev);
                  if (next.has(group.id)) {
                    next.delete(group.id);
                  } else {
                    next.add(group.id);
                  }
                  return next;
                });
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${group.color} text-white`}>
                  <Icon size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">
                    {group.chatbots.length} chatbot{group.chatbots.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </button>

            {isExpanded && (
              <div className="border-t divide-y">
                {hasItems ? (
                  <>
                    {group.groups.map(subgroup => (
                      <div key={subgroup.id} className="border-t">
                        <button
                          onClick={() => toggleGroup(subgroup.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown 
                              size={16} 
                              className={`text-gray-400 transition-transform ${
                                expandedGroups.has(subgroup.id) ? 'rotate-180' : ''
                              }`}
                            />
                            <span className="font-medium text-gray-700">{subgroup.name}</span>
                            <span className="text-sm text-gray-500">
                              ({subgroup.chatbots.length})
                            </span>
                          </div>
                        </button>

                        {expandedGroups.has(subgroup.id) && (
                          <div className="pl-8 divide-y">
                            {subgroup.chatbots.map(chatbot => (
                              <ChatbotItem
                                key={chatbot.id}
                                chatbot={chatbot}
                                onSelect={onSelectChatbot}
                                onEdit={onEditChatbot}
                                onDelete={() => setChatbotToDelete(chatbot)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {group.chatbots.length > 0 && (
                      <div className="border-t">
                        <div className="p-3 bg-gray-50">
                          <span className="text-sm text-gray-500">Não agrupados</span>
                        </div>
                        <div className="divide-y">
                          {group.chatbots.map(chatbot => (
                            <ChatbotItem
                              key={chatbot.id}
                              chatbot={chatbot}
                              onSelect={onSelectChatbot}
                              onEdit={onEditChatbot}
                              onDelete={() => setChatbotToDelete(chatbot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {group.id === 'whatsapp' ? (
                      <p>Nenhum chatbot configurado para {group.name}</p>
                    ) : (
                      <p>Em breve: Chatbots para {group.name}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <AlertDialog open={!!chatbotToDelete} onOpenChange={() => setChatbotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Chatbot</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o chatbot "{chatbotToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (chatbotToDelete) {
                  onDeleteChatbot(chatbotToDelete.id);
                  setChatbotToDelete(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}