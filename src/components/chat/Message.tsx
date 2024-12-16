import React from 'react';
import { Check, Image, FileText, Video } from 'lucide-react';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
  isOutgoing: boolean;
}

export function Message({ message, isOutgoing }: MessageProps) {
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={message.mediaUrl}
                alt="Imagem"
                className="max-w-sm rounded-lg"
              />
              <div className="absolute top-2 right-2">
                <Image className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'document':
        return (
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
            <FileText className="w-8 h-8" />
            <div>
              <p className="text-sm font-medium">{message.content}</p>
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
              >
                Baixar documento
              </a>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <div className="relative">
              <video
                src={message.mediaUrl}
                controls
                className="max-w-sm rounded-lg"
              />
              <div className="absolute top-2 right-2">
                <Video className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      default:
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div
      className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[70%] rounded-lg p-3 space-y-1
          ${isOutgoing 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border shadow-sm'
          }
        `}
      >
        {renderContent()}
        
        <div className="flex items-center justify-end gap-1 text-xs opacity-70">
          <time>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
          {isOutgoing && (
            <span className="flex items-center">
              <Check size={14} className={message.status === 'read' ? 'text-blue-300' : ''} />
              {message.status === 'delivered' && <Check size={14} className="-ml-1" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}