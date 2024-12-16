import { useCallback } from 'react';
import type { Contact } from '../../../types';
import type { ContactActions } from '../types';

export function useContactActions(
  contacts: Contact[],
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
): ContactActions {
  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, ...updates, updatedAt: new Date() }
          : contact
      )
    );
  }, [setContacts]);

  const addTagToContact = useCallback((contactId: string, tag: string) => {
    setContacts(prev =>
      prev.map(contact => {
        if (contact.id === contactId && !contact.tags.includes(tag)) {
          return {
            ...contact,
            tags: [...contact.tags, tag],
            updatedAt: new Date()
          };
        }
        return contact;
      })
    );
  }, [setContacts]);

  const removeTagFromContact = useCallback((contactId: string, tag: string) => {
    setContacts(prev =>
      prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            tags: contact.tags.filter(t => t !== tag),
            updatedAt: new Date()
          };
        }
        return contact;
      })
    );
  }, [setContacts]);

  const addCustomField = useCallback((contactId: string, key: string, value: string) => {
    setContacts(prev =>
      prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            customFields: {
              ...contact.customFields,
              [key]: value
            },
            updatedAt: new Date()
          };
        }
        return contact;
      })
    );
  }, [setContacts]);

  const removeCustomField = useCallback((contactId: string, key: string) => {
    setContacts(prev =>
      prev.map(contact => {
        if (contact.id === contactId) {
          const { [key]: _, ...remainingFields } = contact.customFields;
          return {
            ...contact,
            customFields: remainingFields,
            updatedAt: new Date()
          };
        }
        return contact;
      })
    );
  }, [setContacts]);

  return {
    updateContact,
    addTagToContact,
    removeTagFromContact,
    addCustomField,
    removeCustomField
  };
}