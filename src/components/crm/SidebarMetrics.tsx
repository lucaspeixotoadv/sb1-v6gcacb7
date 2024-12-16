import React from 'react';
import { MessageSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useTeam } from '../../contexts/TeamContext';

interface SidebarMetricsProps {
  className?: string;
}

export function SidebarMetrics({ className = '' }: SidebarMetricsProps) {
  const { queue } = useTeam();
  const { messages } = useMessaging();

  // Calculate metrics
  const unassigned = queue?.items.length || 0;
  const inProgress = messages.filter(m => m.status === 'sent').length;
  const waiting = messages.filter(m => m.status === 'delivered').length;
  const resolved = messages.filter(m => m.status === 'read').length;

  return (
    <div className={`w-full px-2 space-y-2 ${className}`}>
      <button className="w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 group">
        <div className="flex items-center justify-center gap-2 text-yellow-500">
          <AlertCircle size={16} />
          <span className="text-xs font-medium">{unassigned}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Não atribuídos
        </p>
      </button>

      <button className="w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 group">
        <div className="flex items-center justify-center gap-2 text-blue-500">
          <MessageSquare size={16} />
          <span className="text-xs font-medium">{inProgress}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Em atendimento
        </p>
      </button>

      <button className="w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 group">
        <div className="flex items-center justify-center gap-2 text-orange-500">
          <Clock size={16} />
          <span className="text-xs font-medium">{waiting}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Aguardando
        </p>
      </button>

      <button className="w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 group">
        <div className="flex items-center justify-center gap-2 text-green-500">
          <CheckCircle2 size={16} />
          <span className="text-xs font-medium">{resolved}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Resolvidos
        </p>
      </button>
    </div>
  );
}