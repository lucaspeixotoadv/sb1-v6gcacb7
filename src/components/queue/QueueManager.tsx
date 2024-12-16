import React from 'react';
import { MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import type { ChatQueue, QueueItem } from '../../types/chat';
import { useTeam } from '../../contexts/TeamContext';

interface QueueManagerProps {
  queue: ChatQueue;
  onAssignChat: (item: QueueItem, userId: string) => void;
}

export function QueueManager({ queue, onAssignChat }: QueueManagerProps) {
  const { currentTeam } = useTeam();
  const [selectedItem, setSelectedItem] = React.useState<Q ueueItem | null>(null);

  const getWaitTime = (enteredAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - enteredAt.getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes;
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium">Fila de Atendimento</h3>
        <p className="text-sm text-gray-500 mt-1">
          {queue.items.length} mensagens aguardando
        </p>
      </div>

      <div className="divide-y max-h-[600px] overflow-y-auto">
        {queue.items.map(item => {
          const waitTime = getWaitTime(item.enteredAt);
          const isUrgent = waitTime > 15 || item.priority > 1;

          return (
            <div
              key={item.id}
              className={`p-4 hover:bg-gray-50 ${
                selectedItem?.id === item.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isUrgent ? <AlertTriangle size={20} /> : <MessageSquare size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.lastMessage?.content || 'Nova mensagem'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.tags.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={14} className={isUrgent ? 'text-red-500' : 'text-gray-400'} />
                      <span className={isUrgent ? 'text-red-500' : 'text-gray-500'}>
                        {waitTime}min
                      </span>
                    </div>
                  </div>

                  {selectedItem?.id === item.id && currentTeam && (
                    <div className="mt-3 flex gap-2">
                      {currentTeam.members.map(userId => {
                        const user = currentTeam.members.find(m => m === userId);
                        if (!user) return null;

                        return (
                          <button
                            key={userId}
                            onClick={() => onAssignChat(item, userId)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Atribuir
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}