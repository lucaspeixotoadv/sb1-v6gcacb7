import { useState, useCallback } from 'react';
import type { Team, User } from '../types/users';

const INITIAL_TEAMS: Team[] = [];

export function useTeams(initialTeams: Team[] = INITIAL_TEAMS) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  const addTeam = useCallback((teamData: Partial<Team>) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name!,
      supervisorId: teamData.supervisorId!,
      members: teamData.members || [],
      settings: {
        autoAssignment: true,
        assignmentStrategy: 'round-robin',
        workingHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'America/Sao_Paulo',
          days: [1, 2, 3, 4, 5] // Monday to Friday
        },
        maxQueueSize: 100,
        priorityTags: []
      },
      stats: {
        activeChats: 0,
        queueSize: 0,
        averageWaitTime: 0,
        averageHandleTime: 0,
        totalMessagesToday: 0,
        satisfaction: 0,
        onlineAgents: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...teamData
    };

    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  }, []);

  const updateTeam = useCallback((teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          ...updates,
          updatedAt: new Date()
        };
      }
      return team;
    }));
  }, []);

  const deleteTeam = useCallback((teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
  }, []);

  const addMemberToTeam = useCallback((teamId: string, userId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId && !team.members.includes(userId)) {
        // Update team stats
        const updatedStats = {
          ...team.stats,
          onlineAgents: team.stats.onlineAgents + 1
        };

        return {
          ...team,
          members: [...team.members, userId],
          stats: updatedStats,
          updatedAt: new Date()
        };
      }
      return team;
    }));

    // Update user's teamId
    updateUser(userId, { teamId });
  }, []);

  const removeMemberFromTeam = useCallback((teamId: string, userId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        // Update team stats
        const updatedStats = {
          ...team.stats,
          onlineAgents: Math.max(0, team.stats.onlineAgents - 1)
        };

        return {
          ...team,
          members: team.members.filter(id => id !== userId),
          stats: updatedStats,
          updatedAt: new Date()
        };
      }
      return team;
    }));

    // Remove teamId from user
    updateUser(userId, { teamId: undefined });
  }, []);

  const getTeamByUser = useCallback((userId: string) => {
    return teams.find(team => 
      team.supervisorId === userId || team.members.includes(userId)
    );
  }, [teams]);

  const updateTeamStats = useCallback((teamId: string, updates: Partial<Team['stats']>) => {
    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          stats: {
            ...team.stats,
            ...updates
          },
          updatedAt: new Date()
        };
      }
      return team;
    }));
  }, []);

  return {
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    getTeamByUser,
    updateTeamStats
  };
}