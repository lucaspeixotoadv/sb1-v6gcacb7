// /src/contexts/MessagingContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useZAPI } from '../hooks/useZAPI';
import { useMessages } from '../hooks/useMessages';
import { useContacts } from '../hooks/useContacts';
import { WebhookHandler } from '../services/zapi/webhookHandler';
import { logger } from '@/utils/logger';
import type { ZAPIWebhookMessage, ZAPISendMessageOptions, ZAPIConfig } from '../services/zapi/types';
import type { Message } from '../types';

interface MessagingContextType {
  sendMessage: (options: ZAPISendMessageOptions) => Promise<void>;
  connect: () => Promise<void>;
  initialize: (config: ZAPIConfig) => void;
  status: {
    connected: boolean;
    session: 'connected' | 'disconnected' | 'connecting';
  } | null;
  qrCode: string | null;
  messages: Message[];
  getContactMessages: (contactId: string) => Message[];
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { sendMessage: zapiSendMessage, status, initialize, connect, qrCode } = useZAPI();
  const { messages, addMessage, updateMessageStatus, getContactMessages } = useMessages();
  const { findContactByPhone, addContact } = useContacts();

  const handleWebhookMessage = useCallback((message: ZAPIWebhookMessage) => {
    logger.info('Processing webhook message', {
      type: message.type,
      messageId: message.messageId,
      phone: message.phone,
      fromMe: message.fromMe
    });

    // Procura contato existente ou cria um novo
    let contact = findContactByPhone(message.phone);
    const messageId = message.messageId || message.ids?.[0];
    if (!messageId) {
      logger.warn('No messageId found in webhook message', { message });
      return;
    }

    const now = new Date();
    
    if (!contact) {
      logger.info('Creating new contact from webhook message');
      // Cria novo contato a partir dos dados do webhook
      const firstName = message.senderName?.split(' ')[0] || 'Sem Nome';
      const lastName = message.senderName?.split(' ').slice(1).join(' ');
      const fullName = message.senderName || 'Sem Nome';
      
      contact = {
        id: `contact-${Date.now()}`,
        firstName,
        lastName,
        fullName,
        phone: message.phone,
        tags: [],
        customFields: {},
        createdAt: now,
        updatedAt: now,
        senderPhoto: message.senderPhoto || message.photo
      };

      addContact(contact);
      logger.info('New contact created', { contact });
    }

    // Processa diferentes tipos de mensagem
    const newMessage: Message = {
      id: messageId,
      contactId: contact.id,
      content: message.text?.message || '',
      type: 'text',
      direction: message.fromMe ? 'outgoing' : 'incoming',
      status: message.status === 'RECEIVED' ? 'delivered' : 'sent',
      timestamp: new Date(message.momment),
      mediaUrl: message.photo || message.senderPhoto
    };

    addMessage(newMessage);
    logger.info('New message added', { messageId, contactId: contact.id });
  }, [findContactByPhone, addContact, addMessage]);

  const handleWebhookStatus = useCallback((message: ZAPIWebhookMessage) => {
    const messageId = message.messageId || message.ids?.[0];
    if (!messageId) {
      logger.warn('No messageId found in status update', { message });
      return;
    }

    try {
      const status = message.status === 'RECEIVED' ? 'delivered' : 
                    message.status === 'READ' ? 'read' : 'sent';
      updateMessageStatus(messageId, status);
      logger.info('Message status updated', { messageId, status });
    } catch (error) {
      logger.error('Failed to process message status', { error, messageId });
    }
  }, [updateMessageStatus]);

  useEffect(() => {
    logger.info('Registering webhook handlers');
    
    WebhookHandler.addHandler('message', handleWebhookMessage);
    WebhookHandler.addHandler('status', handleWebhookStatus);

    return () => {
      logger.info('Removing webhook handlers');
      WebhookHandler.removeHandler('message', handleWebhookMessage);
      WebhookHandler.removeHandler('status', handleWebhookStatus);
    };
  }, [handleWebhookMessage, handleWebhookStatus]);

  const handleSendMessage = useCallback(async (options: ZAPISendMessageOptions) => {
    if (!status?.connected) {
      logger.error('Cannot send message: WhatsApp not connected');
      throw new Error('WhatsApp não está conectado');
    }

    try {
      logger.info('Sending message', { phone: options.phone });
      const { messageId } = await zapiSendMessage(options);
      
      addMessage({
        id: messageId,
        contactId: options.phone,
        content: options.message,
        type: 'text',
        direction: 'outgoing',
        status: 'sent',
        timestamp: new Date()
      });

      logger.info('Message sent successfully', { messageId, phone: options.phone });
    } catch (error) {
      logger.error('Failed to send message', { error, options });
      throw error;
    }
  }, [status, zapiSendMessage, addMessage]);

  const value = {
    sendMessage: handleSendMessage,
    status,
    connect,
    initialize,
    qrCode,
    messages,
    getContactMessages
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}