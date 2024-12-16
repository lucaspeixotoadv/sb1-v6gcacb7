import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { NewContactModal } from './contacts/NewContactModal';
import { ContactEditModal } from './contacts/ContactEditModal';
import type { Contact } from '../../types';

export function ContactsArea() {
  const { contacts } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showNewContactModal, setShowNewContactModal] = useState(false);

  const filteredContacts = React.useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return contacts.filter(contact => 
      (contact.fullName && contact.fullName.toLowerCase().includes(lowerCaseSearch)) ||
      (contact.phone && contact.phone.includes(searchTerm)) ||
      (contact.email && contact.email.toLowerCase().includes(lowerCaseSearch)) ||
      (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch)))
    );
  }, [contacts, searchTerm]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b relative z-[1]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Contatos</h2>
          <button 
            onClick={() => setShowNewContactModal(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Contato
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar contatos por nome, telefone, email ou etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-medium text-gray-700">
                    {(contact.fullName ?? '').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{contact.fullName}</h3>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                  {contact.email && (
                    <p className="text-sm text-gray-500 truncate">{contact.email}</p>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum contato encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <NewContactModal
        isOpen={showNewContactModal}
        onClose={() => setShowNewContactModal(false)}
      />
      
      {selectedContact && (
        <ContactEditModal
          isOpen={!!selectedContact}
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}

export default ContactsArea;