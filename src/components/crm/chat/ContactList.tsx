import React from 'react';
import { Search } from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { useMessaging } from '../../contexts/MessagingContext';
import type { Contact } from '../../types';
import { isValidEmail, isValidPhone } from '../../utils/validators'; // Importação correta

interface ContactListProps {
  selectedContactId?: string;
  onSelectContact: (contact: Contact) => void;
}

export function ContactList({ selectedContactId, onSelectContact }: ContactListProps) {
  const { contacts } = useContacts();
  const { getContactMessages } = useMessaging();
  const [searchTerm, setSearchTerm] = React.useState('');

  const conversations = React.useMemo(() => {
    return contacts
      .map(contact => {
        const messages = getContactMessages(contact.id);
        const lastMessage = messages[messages.length - 1];
        const fullName = `${contact.firstName} ${contact.lastName || ''}`.trim(); // Concatenar primeiro e último nome
        return {
          ...contact,
          fullName, // Adicionar fullName ao objeto de conversação
          lastMessage,
          hasUnread: messages.some(m => m.direction === 'incoming' && m.status !== 'read')
        };
      })
      .filter(conversation => {
        const searchLower = searchTerm.toLowerCase();
        const { fullName, phone, lastMessage } = conversation;
        return (
          (fullName && fullName.toLowerCase().includes(searchLower)) ||
          (phone && phone.includes(searchLower)) ||
          (lastMessage?.content && lastMessage.content.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        if (a.hasUnread && !b.hasUnread) return -1;
        if (!a.hasUnread && b.hasUnread) return 1;
        return (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0);
      });
  }, [contacts, getContactMessages, searchTerm]);

  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Botão "Novo Contato" removido */}
      </div>

      <div className="overflow-y-auto">
        {conversations.map(conversation => (
          <button
            key={conversation.id}
            onClick={() => onSelectContact(conversation)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 border-b transition-colors ${
              selectedContactId === conversation.id ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              {conversation.senderPhoto ? (
                <img 
                  src={conversation.senderPhoto} 
                  alt={conversation.fullName} // Atualizar o alt para fullName
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-indigo-600 font-medium">
                  {conversation.firstName.charAt(0).toUpperCase()} {/* Usar firstName para a inicial */}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">
                  {conversation.fullName} {/* Usar fullName */}
                  {conversation.hasUnread && (
                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block" />
                  )}
                </h3>
                {conversation.lastMessage && (
                  <time className="text-xs text-gray-500">
                    {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                )}
              </div>
              {conversation.lastMessage ? (
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage.direction === 'outgoing' && '✓ '}
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhuma mensagem</p>
              )}
            </div>
          </button>
        ))}

        {conversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Nenhuma conversa encontrada
          </div>
        )}
      </div>

      {/* Modal de Novo Contato removido */}
    </div>
  );
}

export default ContactList;
