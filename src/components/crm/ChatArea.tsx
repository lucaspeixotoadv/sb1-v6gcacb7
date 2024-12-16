import React from 'react';
import { ContactList } from '../chat/ContactList';
import { ChatWindow } from '../chat/ChatWindow';
import { ContactDetails } from '../chat/ContactDetails';
import { useContacts } from '../../hooks/useContacts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Contact } from '../../types';

export function ChatArea() {
  const { contacts } = useContacts();
  const [selectedContactId, setSelectedContactId] = React.useState<string | undefined>();
  const [isExpanded, setIsExpanded] = useLocalStorage('contactDetailsExpanded', false);

  const selectedContact = React.useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId);
  }, [contacts, selectedContactId]);

  const handleContactSelect = React.useCallback((contact: Contact) => {
    setSelectedContactId(contact.id);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-50">
      {/* Lista de contatos - Fixa à esquerda */}
      <aside className="w-[360px] border-r border-gray-200 bg-white flex-shrink-0 overflow-y-auto relative z-[1]">
        <ContactList
          selectedContactId={selectedContactId}
          onSelectContact={handleContactSelect}
          className="h-full"
        />
      </aside>

      {/* Container principal - Área de chat e painel de detalhes */}
      <main className="flex-1 flex overflow-hidden">
        {/* Área do chat - Ajusta-se dinamicamente */}
        <div className="flex-1 min-w-0">
          <ChatWindow
            contact={selectedContact}
            className="h-full w-full"
          />
        </div>

        {/* Painel lateral de detalhes - Fixo à direita */}
        {selectedContact && (
          <aside 
            className={`flex-shrink-0 h-full bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
              isExpanded ? 'w-[320px]' : 'w-[40px]'
            }`}
            aria-label="Detalhes do contato"
          >
            <ContactDetails
              contact={selectedContact}
              isExpanded={isExpanded}
              onToggleExpanded={() => setIsExpanded(!isExpanded)}
              className="h-full w-full"
            />
          </aside>
        )}
      </main>
    </div>
  );
}