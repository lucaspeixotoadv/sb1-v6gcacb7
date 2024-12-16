import React from 'react';
import { Facebook, Instagram, Send, MessageCircleMore } from 'lucide-react';
import type { ChatbotChannel } from '../types';

interface ChannelGridProps {
  onSelectChannel: (channel: ChatbotChannel) => void;
}

const CHANNELS = [
  {
    id: 'whatsapp' as const,
    name: 'WhatsApp',
    icon: MessageCircleMore,
    color: 'bg-green-500 hover:bg-green-600',
    available: true
  },
  {
    id: 'messenger' as const,
    name: 'Messenger',
    icon: Facebook,
    color: 'bg-blue-500 hover:bg-blue-600',
    available: false
  },
  {
    id: 'instagram' as const,
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-500 hover:bg-pink-600',
    available: false
  },
  {
    id: 'telegram' as const,
    name: 'Telegram',
    icon: Send,
    color: 'bg-sky-500 hover:bg-sky-600',
    available: false
  }
] as const;

export function ChannelGrid({ onSelectChannel }: ChannelGridProps) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-8">Selecione um Canal</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CHANNELS.map(({ id, name, icon: Icon, color, available }) => (
          <button
            key={id}
            onClick={() => available && onSelectChannel(id)}
            className={`
              relative aspect-square rounded-xl shadow-sm border transition-all
              ${available 
                ? `${color} text-white hover:shadow-lg transform hover:-translate-y-1` 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Icon size={48} className="mb-4" />
              <span className="font-medium">{name}</span>
              
              {!available && (
                <span className="absolute top-2 right-2 text-xs bg-white/90 text-gray-600 px-2 py-1 rounded">
                  Em breve
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}