import { useCallback } from 'react';
import type { ZAPIWebhookMessage } from '../services/zapi/types';
import type { Message } from '../types';

export function useMessageHandlers(
  addMessage: (message: Message) => void,
  updateMessageStatus: (messageId: string, status: Message['status']) => void
) {
  const handleMessage = useCallback((message: ZAPIWebhookMessage) => {
    const newMessage: Message = {
      id: message.messageId,
      contactId: message.phone,
      content: message.text?.message || '',
      type: 'text',
      direction: message.fromMe ? 'outgoing' : 'incoming',
      status: message.status === 'RECEIVED' ? 'delivered' : 'sent',
      timestamp: new Date(message.momment),
      senderName: message.senderName,
      senderPhoto: message.senderPhoto || message.photo
    };

    addMessage(newMessage);
  }, [addMessage]);

  const handleStatus = useCallback((message: ZAPIWebhookMessage) => {
    if (message.messageId && message.status) {
      const status = message.status === 'RECEIVED' ? 'delivered' : 
                    message.status === 'READ' ? 'read' : 'sent';
      updateMessageStatus(message.messageId, status);
    }
  }, [updateMessageStatus]);

  return {
    handleMessage,
    handleStatus
  };
}