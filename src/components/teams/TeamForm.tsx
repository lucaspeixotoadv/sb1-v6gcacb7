import React from 'react';
import { X, Save, Clock, Users } from 'lucide-react';
import type { Team, User } from '../../types/users';
import { useUser } from '../../contexts/UserContext';

interface TeamFormProps {
  team?: Partial<Team>;
  availableUsers: User[];
  onSubmit: (data: Partial<Team>) => void;
  onClose: () => void;
}

export function TeamForm({ team, availableUsers, onSubmit, onClose }: TeamFormProps) {
  const { hasPermission } = useUser();
  const [formData, setFormData] = React.useState<Partial<Team>>(team || {
    settings: {
      autoAssignment: true,
      assignmentStrategy: 'round-robin',
      workingHours: {
        start: '09:00',
        end: '18:00',
        timezone: 'America/Sao_Paulo',
        days: [1, 2, 3, 4, 5]
      },
      maxQueueSize: 100,
      priorityTags: []
    },
    members: []
  });

  const supervisors = availableUsers.filter(user => 
    user.role === 'supervisor' || user.role === 'admin'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {team ? 'Editar Equipe' : 'Nova Equipe'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Equipe
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor
              </label>
              <select
                value={formData.supervisorId || ''}
                onChange={e => setFormData(prev => ({ ...prev, supervisorId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Selecione...</option>
                {supervisors.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Clock size={16} />
              Horário de Atendimento
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Início
                </label>
                <input
                  type="time"
                  value={formData.settings?.workingHours?.start || '09:00'}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      workingHours: {
                        ...prev.settings?.workingHours,
                        start: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Fim
                </label>
                <input
                  type="time"
                  value={formData.settings?.workingHours?.end || '18:00'}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      workingHours: {
                        ...prev.settings?.workingHours,
                        end: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Users size={16} />
              Membros da Equipe
            </h3>

            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
              {availableUsers
                .filter(user => user.role === 'agent' && !user.teamId)
                .map(user => (
                  <label
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members?.includes(user.id) || false}
                      onChange={e => {
                        const members = formData.members || [];
                        setFormData(prev => ({
                          ...prev,
                          members: e.target.checked
                            ? [...members, user.id]
                            : members.filter(id => id !== user.id)
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </label>
                ))}
              {availableUsers.filter(user => user.role === 'agent').length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum agente disponível para adicionar à equipe
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
            >
              <Save size={20} />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}