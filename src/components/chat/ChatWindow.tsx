import React from 'react';
import { Send, Image, Paperclip } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import type { Contact } from '../../types';

interface ChatWindowProps {
  contact?: Contact;
  className?: string;
}

export function ChatWindow({ contact, className = '' }: ChatWindowProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { status, sendMessage, getContactMessages } = useMessaging();

  const messages = contact ? getContactMessages(contact.id) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!contact || !newMessage.trim()) return;

    try {
      await sendMessage({
        phone: contact.phone,
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
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
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <p className="text-gray-500">Selecione um contato para iniciar o chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Cabeçalho do Chat */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              {contact?.firstName?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h2 className="font-medium text-gray-900">{contact?.fullName || 'Sem nome'}</h2>
            <p className="text-sm text-gray-500">
              {contact?.isTyping ? (
                <span className="text-blue-600">Digitando...</span>
              ) : contact?.lastSeen ? (
                `Visto por último em ${new Date(contact.lastSeen).toLocaleString('pt-BR')}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.direction === 'outgoing'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <time className="text-xs text-gray-300">
                    {new Date(message.timestamp).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {message.direction === 'outgoing' && (
                    <span className="text-xs text-gray-300">
                      {message.status === 'sent' && '✓'}
                      {message.status === 'delivered' && '✓✓'}
                      {message.status === 'read' && '✓✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Campo de entrada de mensagem */}
      <div className="flex-shrink-0 px-6 py-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite uma mensagem..."
              className="w-full px-4 py-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || !status?.connected}
              className="absolute right-3 bottom-2.5 p-2 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}