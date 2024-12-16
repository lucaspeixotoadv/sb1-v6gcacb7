```tsx
import React, { useState } from 'react';
import { Mail, Phone, Tag, Edit2 } from 'lucide-react';
import { ContactEditModal } from './ContactEditModal';
import type { Contact } from '../../../types';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div 
        onClick={() => setShowEditModal(true)}
        className="bg-white p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium text-indigo-600">
              {contact.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={16} />
              </button>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} />
                <span>{contact.phone}</span>
              </div>

              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span>{contact.email}</span>
                </div>
              )}

              {contact.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Tag size={14} className="text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContactEditModal
        isOpen={showEditModal}
        contact={contact}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
```