import React from 'react';
import type { UserStatus } from '../../types/users';

interface UserStatusBadgeProps {
  status: UserStatus;
}

const STATUS_STYLES: Record<UserStatus, { bg: string; text: string; label: string }> = {
  available: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Disponível'
  },
  busy: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Ocupado'
  },
  away: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    label: 'Ausente'
  },
  offline: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: 'Offline'
  }
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const styles = STATUS_STYLES[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
      {styles.label}
    </span>
  );
}