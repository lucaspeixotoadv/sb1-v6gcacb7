import React from 'react';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useTeam } from '../../contexts/TeamContext';

export function MetricsArea() {
  const { queue } = useTeam();
  const { messages } = useMessaging();

  // Calculate metrics
  const unassigned = queue?.items.length || 0;
  const inProgress = messages.filter(m => m.status === 'sent').length;
  const waiting = messages.filter(m => m.status === 'delivered').length;
  const resolved = messages.filter(m => m.status === 'read').length;

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Métricas</h2>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Não Atribuídos</p>
                <p className="text-2xl font-semibold">{unassigned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Atendimento</p>
                <p className="text-2xl font-semibold">{inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aguardando</p>
                <p className="text-2xl font-semibold">{waiting}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolvidos</p>
                <p className="text-2xl font-semibold">{resolved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Performance da Equipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Agentes Online</span>
              </div>
              <p className="text-2xl font-semibold">5</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Tempo Médio de Resposta</span>
              </div>
              <p className="text-2xl font-semibold">2.5min</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Taxa de Resolução</span>
              </div>
              <p className="text-2xl font-semibold">92%</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-medium">Atividade Recente</h3>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Atendimento #{1000 + i}
                    </p>
                    <p className="text-sm text-gray-500">
                      Resolvido por João Silva
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    há {5 * i + 5} minutos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}