import React from 'react';
import { X, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useContacts } from '../../../contexts/ContactsContext';
import { Button } from '../../ui/Button';
import { ContactFormFields } from './forms/ContactFormFields';
import { useContactForm } from './hooks/useContactForm';
import { initialFormData } from './types';
import type { Contact } from '../../../types';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewContactModal({ isOpen, onClose }: NewContactModalProps) {
  const { addContact } = useContacts();
  const { formData, errors, validateForm, handleChange, resetForm } = useContactForm(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    
    const now = new Date();

    const newContact: Contact = {
      id: uuidv4(),
      firstName,
      lastName: lastName || undefined,
      fullName,
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      birthDate: formData.birthDate || undefined,
      tags: [],
      customFields: {},
      createdAt: now,
      updatedAt: now
    };

    addContact(newContact);
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">Novo Contato</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ContactFormFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              <Save size={20} className="mr-2" />
              Salvar Contato
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}