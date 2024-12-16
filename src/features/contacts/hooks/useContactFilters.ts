import { useState, useCallback, useMemo } from 'react';
import type { Contact } from '../../../types';
import type { ContactFilters } from '../types';

export function useContactFilters(contacts: Contact[]) {
  const [filters, setFilters] = useState<ContactFilters>({
    searchTerm: '',
    tags: [],
    status: 'all'
  });

  const updateFilters = useCallback((newFilters: Partial<ContactFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !filters.searchTerm || 
        contact.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        contact.phone.includes(filters.searchTerm) ||
        contact.email?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesTags = filters.tags.length === 0 ||
        filters.tags.some(tag => contact.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [contacts, filters]);

  return {
    filters,
    setFilters: updateFilters,
    filteredContacts
  };
}