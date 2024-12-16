import { useCallback } from 'react';
import { useContacts } from '../../../hooks/useContacts';
import { processWebhookData } from '../services/webhookProcessor';
import type { WebhookRequest, WebhookConfig } from '../types';

export function useWebhookProcessor() {
  const { contacts, updateContact, addTagToContact } = useContacts();

  const processRequest = useCallback(async (request: WebhookRequest, config: WebhookConfig) => {
    const processedData = processWebhookData(request, config);
    if (!processedData) return null;

    // Procura contato existente pelo telefone
    let contact = contacts.find(c => c.phone === processedData.phone);

    if (contact) {
      // Atualiza contato existente
      const updates: any = {};
      
      if (processedData.name) {
        updates.name = processedData.name;
      }

      if (processedData.customFields) {
        updates.customFields = {
          ...contact.customFields,
          ...processedData.customFields
        };
      }

      if (Object.keys(updates).length > 0) {
        updateContact(contact.id, updates);
      }

      // Adiciona novas tags
      if (processedData.tags) {
        for (const tag of processedData.tags) {
          addTagToContact(contact.id, tag);
        }
      }

      return contact;
    }

    // TODO: Criar novo contato se necessário
    return null;
  }, [contacts, updateContact, addTagToContact]);

  return {
    processRequest
  };
}