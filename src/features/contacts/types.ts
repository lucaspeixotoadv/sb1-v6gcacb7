import type { Contact as BaseContact } from '../../types';

export interface ContactFilters {
  searchTerm: string;
  tags: string[];
  status: 'all' | 'active' | 'inactive';
}

export interface ContactActions {
  updateContact: (contactId: string, updates: Partial<BaseContact>) => void;
  addTagToContact: (contactId: string, tag: string) => void;
  removeTagFromContact: (contactId: string, tag: string) => void;
  addCustomField: (contactId: string, key: string, value: string) => void;
  removeCustomField: (contactId: string, key: string) => void;
}

export interface UseContactsReturn extends ContactActions {
  contacts: BaseContact[];
  filteredContacts: BaseContact[];
  setFilters: (filters: Partial<ContactFilters>) => void;
}