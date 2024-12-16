import { useState, useCallback } from 'react';
import type { Contact } from '../types';
import type { UseContactsReturn } from '../features/contacts/types';

const initialContacts: Contact[] = [];

export function useContacts(): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const addContact = useCallback((contact: Contact) => {
    setContacts(prev => [...prev, contact]);
  }, []);

  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    setContacts(prev =>
      prev.map(contact => {
        if (contact.id === contactId) {
          const firstName = updates.firstName || contact.firstName;
          const lastName = updates.lastName || contact.lastName;
          const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();

          return {
            ...contact,
            ...updates,
            firstName,
            lastName,
            fullName,
            updatedAt: new Date()
          };
        }
        return contact;
      })
    );
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  const findContactByPhone = useCallback((phone: string): Contact | undefined => {
    return contacts.find(c => c.phone === phone);
  }, [contacts]);

  return {
    contacts,
    addContact,
    updateContact,
    addTagToContact,
    removeTagFromContact,
    addCustomField,
    removeCustomField,
    findContactByPhone
  };
}