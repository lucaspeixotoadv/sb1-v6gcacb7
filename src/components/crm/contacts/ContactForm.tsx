import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';
import { isValidPhone, isValidEmail } from '../../../utils/validators';
import type { Contact } from '../../../types';

interface ContactFormProps {
  initialData?: Partial<Contact>;
  onSubmit: (data: Partial<Contact>) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
}

export function ContactForm({ initialData, onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Construindo o nome completo
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`;
    
    onSubmit({
      firstName,
      lastName: lastName || undefined,
      fullName,
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      updatedAt: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Nome"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sobrenome
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sobrenome"
          />
        </div>
      </div>

      <PhoneInput
        value={formData.phone}
        onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
        error={errors.phone}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Observações sobre o contato..."
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Salvar Contato
      </button>
    </form>
  );
}