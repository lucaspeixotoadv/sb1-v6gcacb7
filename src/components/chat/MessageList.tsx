import React from 'react';
import { Message } from './Message';
import type { Message as MessageType } from '../../types';

interface MessageListProps {
  messages: MessageType[];
  contactId: string;
}

export function MessageList({ messages, contactId }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Agrupa mensagens por data
  const messagesByDate = React.useMemo(() => {
    const groups: { [key: string]: MessageType[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(messagesByDate).map(([date, msgs]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {date}
            </span>
          </div>
          
          {msgs.map(message => (
            <Message
              key={message.id}
              message={message}
              isOutgoing={message.direction === 'outgoing'}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}