import React from 'react';
import { Clock, Users, MessageSquare, TrendingUp } from 'lucide-react';
import type { TeamStats } from '../../types/users';

interface QueueStatsProps {
  stats: TeamStats;
}

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Na Fila</p>
            <p className="text-xl font-semibold">{stats.queueSize}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Users size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Agentes Online</p>
            <p className="text-xl font-semibold">{stats.onlineAgents}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tempo Médio</p>
            <p className="text-xl font-semibold">
              {Math.round(stats.averageWaitTime / 60)}min
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Atendimentos</p>
            <p className="text-xl font-semibold">{stats.totalMessagesToday}</p>
          </div>
        </div>
      </div>
    </div>
  );
}