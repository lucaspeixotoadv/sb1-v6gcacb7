import React, { useState } from 'react';
import { Send, Paperclip, Image } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'image' | 'document') => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim(), 'text');
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Simula indicador de digitação
    if (!isTyping) {
      setIsTyping(true);
      // Notifica que começou a digitar
    }
    
    // Debounce para notificar que parou de digitar
    const timeout = setTimeout(() => {
      setIsTyping(false);
      // Notifica que parou de digitar
    }, 1000);

    return () => clearTimeout(timeout);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 bg-white border-t">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder="Digite uma mensagem..."
          className="w-full px-4 py-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          disabled={disabled}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Anexar arquivo"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button" 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Enviar imagem"
          >
            <Image size={20} />
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={20} />
      </button>
    </form>
  );
}