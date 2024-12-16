import { useState, useCallback, useEffect } from 'react';
import type { Message } from '../types';

interface MessageOperationState {
  loading: boolean;
  error: string | null;
}

interface MessagesState {
  items: Message[];
  operation: MessageOperationState;
}

export function useMessages(initialMessages: Message[] = []) {
  const [state, setState] = useState<MessagesState>({
    items: initialMessages,
    operation: {
      loading: false,
      error: null
    }
  });

  // Reset error quando mensagens mudam
  useEffect(() => {
    if (state.operation.error) {
      setState(prev => ({
        ...prev,
        operation: { loading: false, error: null }
      }));
    }
  }, [state.items]);

  const addMessage = useCallback(async (message: Message) => {
    setState(prev => ({
      ...prev,
      operation: { loading: true, error: null }
    }));

    try {
      // Validações básicas
      if (!message.id || !message.contactId) {
        throw new Error('Mensagem inválida: ID e contactId são obrigatórios');
      }

      // Verifica duplicação
      if (state.items.some(m => m.id === message.id)) {
        throw new Error('Mensagem duplicada');
      }

      setState(prev => ({
        items: [...prev.items, message],
        operation: { loading: false, error: null }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar mensagem';
      setState(prev => ({
        ...prev,
        operation: { loading: false, error: errorMessage }
      }));
      throw error;
    }
  }, [state.items]);

  const updateMessageStatus = useCallback(async (messageId: string, status: Message['status']) => {
    setState(prev => ({
      ...prev,
      operation: { loading: true, error: null }
    }));

    try {
      // Verifica se a mensagem existe
      const messageExists = state.items.some(m => m.id === messageId);
      if (!messageExists) {
        throw new Error('Mensagem não encontrada');
      }

      setState(prev => ({
        items: prev.items.map(msg =>
          msg.id === messageId
            ? { ...msg, status }
            : msg
        ),
        operation: { loading: false, error: null }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status';
      setState(prev => ({
        ...prev,
        operation: { loading: false, error: errorMessage }
      }));
      throw error;
    }
  }, [state.items]);

  const getContactMessages = useCallback((contactId: string) => {
    return state.items.filter(msg => msg.contactId === contactId);
  }, [state.items]);

  const deleteMessage = useCallback(async (messageId: string) => {
    setState(prev => ({
      ...prev,
      operation: { loading: true, error: null }
    }));

    try {
      const messageExists = state.items.some(m => m.id === messageId);
      if (!messageExists) {
        throw new Error('Mensagem não encontrada');
      }

      setState(prev => ({
        items: prev.items.filter(msg => msg.id !== messageId),
        operation: { loading: false, error: null }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar mensagem';
      setState(prev => ({
        ...prev,
        operation: { loading: false, error: errorMessage }
      }));
      throw error;
    }
  }, [state.items]);

  const clearMessages = useCallback((contactId?: string) => {
    if (contactId) {
      setState(prev => ({
        items: prev.items.filter(msg => msg.contactId !== contactId),
        operation: { loading: false, error: null }
      }));
    } else {
      setState(prev => ({
        items: [],
        operation: { loading: false, error: null }
      }));
    }
  }, []);

  const getMessageById = useCallback((messageId: string) => {
    return state.items.find(msg => msg.id === messageId);
  }, [state.items]);

  return {
    messages: state.items,
    operationState: state.operation,
    addMessage,
    updateMessageStatus,
    getContactMessages,
    deleteMessage,
    clearMessages,
    getMessageById
  };
}