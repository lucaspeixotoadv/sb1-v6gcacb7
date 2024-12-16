import React from 'react';
import { Search } from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { useMessaging } from '../../contexts/MessagingContext';
import type { Contact, Message } from '../../types';

interface ContactListProps {
  selectedContactId?: string;
  onSelectContact: (contact: Contact) => void;
  className?: string;
}

const TEAMS = [
  { id: 'sales', name: 'Vendas', members: [] },
  { id: 'support', name: 'Suporte', members: [] },
  { id: 'marketing', name: 'Marketing', members: [] }
];

export function ContactList({ selectedContactId, onSelectContact, className = '' }: ContactListProps) {
  const { contacts } = useContacts();
  const { getContactMessages } = useMessaging();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [conversationStatus, setConversationStatus] = React.useState<'all' | 'open' | 'closed'>('all');

  const conversations = React.useMemo(() => {
    return contacts
      .map(contact => {
        const messages = getContactMessages(contact.id);
        const lastMessage = messages[messages.length - 1];
        return {
          ...contact,
          lastMessage,
          hasUnread: messages.some(m => m.direction === 'incoming' && m.status !== 'read')
        };
      })
      .filter(conversation => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (conversation.fullName && conversation.fullName.toLowerCase().includes(searchLower)) ||
          conversation.phone.includes(searchTerm) ||
          (conversation.lastMessage?.content && conversation.lastMessage.content.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        if (a.hasUnread && !b.hasUnread) return -1;
        if (!a.hasUnread && b.hasUnread) return 1;
        return (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0);
      });
  }, [contacts, getContactMessages, searchTerm]);

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      {/* Search Bar */}
      <div className="p-4 space-y-2 relative z-[20]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map(contact => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-b ${
              selectedContactId === contact.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-medium"> 
                {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">
                  {contact.fullName || 'Sem nome'}
                  {contact.hasUnread && (
                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block" />
                  )}
                </h3>
                {contact.lastMessage && (
                  <time className="text-xs text-gray-500">
                    {new Date(contact.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                )}
              </div>
              {contact.lastMessage ? (
                <p className="text-sm text-gray-500 truncate">
                  {contact.lastMessage.direction === 'outgoing' && '✓ '}
                  {contact.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhuma mensagem</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}