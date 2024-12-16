import React from 'react';
import { Send, Paperclip, MoreVertical } from 'lucide-react';
import type { Contact, Message } from '../../../types';

interface MessageAreaProps {
  contact?: Contact;
  messages: Message[];
  onSendMessage: (content: string, type: Message['type']) => void;
}

export function MessageArea({ contact, messages, onSendMessage }: MessageAreaProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), 'text');
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Selecione um contato para iniciar o chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Cabeçalho do Chat */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="ml-3">
            <h3 className="font-medium">{contact?.name}</h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.direction === 'outgoing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onKeyDown={handleKeyPress}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}