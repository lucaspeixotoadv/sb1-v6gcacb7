import React, { useState } from 'react';
import { UserList } from '../../../users/UserList';
import { TeamList } from '../../../teams/TeamList';
import { UserForm } from '../../../users/UserForm';
import { TeamForm } from '../../../teams/TeamForm';
import { useUsers } from '../../../../hooks/useUsers';
import { useTeams } from '../../../../hooks/useTeams';
import { useUser } from '../../../../contexts/UserContext';
import type { User, Team } from '../../../../types/users';

export function TeamManager() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { teams, addTeam, updateTeam } = useTeams();
  const { hasPermission } = useUser();
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleAddUser = (userData: Partial<User>) => {
    addUser(userData);
    setShowUserForm(false);
  };

  const handleEditUser = (userData: Partial<User>) => {
    if (selectedUser) {
      updateUser(selectedUser.id, userData);
      setSelectedUser(null);
    }
  };

  const handleAddTeam = (teamData: Partial<Team>) => {
    addTeam(teamData);
    setShowTeamForm(false);
  };

  const handleEditTeam = (teamData: Partial<Team>) => {
    if (selectedTeam) {
      updateTeam(selectedTeam.id, teamData);
      setSelectedTeam(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Users Section */}
      <UserList
        users={users}
        onAddUser={() => setShowUserForm(true)}
        onEditUser={setSelectedUser}
      />

      {/* Teams Section */}
      {hasPermission('supervisor') && (
        <TeamList
          teams={teams}
          onAddTeam={() => setShowTeamForm(true)}
          onSelectTeam={setSelectedTeam}
        />
      )}

      {/* Modals */}
      {showUserForm && (
        <UserForm
          onSubmit={handleAddUser}
          onClose={() => setShowUserForm(false)}
        />
      )}

      {selectedUser && (
        <UserForm
          user={selectedUser}
          onSubmit={handleEditUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {showTeamForm && (
        <TeamForm
          availableUsers={users}
          onSubmit={handleAddTeam}
          onClose={() => setShowTeamForm(false)}
        />
      )}

      {selectedTeam && (
        <TeamForm
          team={selectedTeam}
          availableUsers={users}
          onSubmit={handleEditTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}