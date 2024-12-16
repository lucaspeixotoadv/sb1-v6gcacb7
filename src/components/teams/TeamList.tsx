import React from 'react';
import { Users, Plus, ChevronRight } from 'lucide-react';
import type { Team } from '../../types/users';
import { useUser } from '../../contexts/UserContext';

interface TeamListProps {
  teams: Team[];
  onAddTeam: () => void;
  onSelectTeam: (team: Team) => void;
}

export function TeamList({ teams, onAddTeam, onSelectTeam }: TeamListProps) {
  const { hasPermission } = useUser();
  const canManageTeams = hasPermission('admin');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Equipes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {teams.length} equipe{teams.length !== 1 ? 's' : ''} configurada{teams.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManageTeams && (
          <button
            onClick={onAddTeam}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Equipe
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <button
            key={team.id}
            onClick={() => onSelectTeam(team)}
            className="bg-white p-6 rounded-lg border hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users size={24} />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  {team.name}
                  <ChevronRight
                    size={16}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {team.members.length} membros
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Atendimentos hoje</p>
                <p className="font-medium text-gray-900 mt-1">
                  {team.stats.totalMessagesToday}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Agentes online</p>
                <p className="font-medium text-gray-900 mt-1">
                  {team.stats.onlineAgents}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  Fila: {team.stats.queueSize} mensagens
                </div>
                <div className="text-gray-500">
                  Tempo médio: {Math.round(team.stats.averageWaitTime / 60)}min
                </div>
              </div>
              
              {team.members.length > 0 && (
                <div className="flex -space-x-2 overflow-hidden">
                  {team.members.slice(0, 5).map((memberId, index) => (
                    <div
                      key={memberId}
                      className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                      title={`Membro ${index + 1}`}
                    >
                      <UserIcon size={16} className="text-gray-500" />
                    </div>
                  ))}
                  {team.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                      +{team.members.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
        
        {teams.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Nenhuma equipe configurada
            </h3>
            <p className="text-sm text-gray-500">
              Clique no botão acima para criar sua primeira equipe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}