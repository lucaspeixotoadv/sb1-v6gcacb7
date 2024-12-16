import React from 'react';
import { User, Mail, Phone, MoreVertical, UserPlus } from 'lucide-react';
import type { User as UserType } from '../../types/users';
import { useUser } from '../../contexts/UserContext';
import { UserStatusBadge } from './UserStatusBadge';

interface UserListProps {
  users: UserType[];
  onAddUser: () => void;
  onEditUser: (user: UserType) => void;
}

export function UserList({ users, onAddUser, onEditUser }: UserListProps) {
  const { hasPermission } = useUser();
  const canManageUsers = hasPermission('supervisor');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Usuários</h2>
        {canManageUsers && (
          <button
            onClick={onAddUser}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
          >
            <UserPlus size={20} />
            Novo Usuário
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                  <UserStatusBadge status={user.status} />
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail size={14} />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} />
                      {user.phone}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    Atendimentos hoje: {user.stats.lastDayStats.chats}
                  </div>
                  {canManageUsers && (
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}