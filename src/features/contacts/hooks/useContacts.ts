import { useState } from 'react';
import { useContactActions } from './useContactActions';
import { useContactFilters } from './useContactFilters';
import type { Contact } from '../../../types';
import type { UseContactsReturn } from '../types';

const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+55 11 99999-9999',
    email: 'joao@exemplo.com',
    tags: ['Cliente', 'VIP'],
    notes: 'Cliente importante, sempre responde rápido.',
    customFields: {
      'Empresa': 'Tech Solutions',
      'Cargo': 'Gerente'
    },
    unread: true,
    lastMessage: 'Olá, gostaria de saber mais...',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+55 11 88888-8888',
    tags: ['Prospect'],
    notes: '',
    customFields: {},
    unread: false,
    lastMessage: 'Obrigado pelo atendimento!',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
  },
];

export function useContacts(): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const { filters, setFilters, filteredContacts } = useContactFilters(contacts);
  const actions = useContactActions(contacts, setContacts);

  return {
    contacts,
    filteredContacts,
    setFilters,
    ...actions
  };
}