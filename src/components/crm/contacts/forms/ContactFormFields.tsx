import React from 'react';
import { PhoneInput } from '../PhoneInput';
import type { FormData, FormErrors } from '../types';

interface ContactFormFieldsProps {
  formData: FormData;
  errors: FormErrors;
  onChange: (field: keyof FormData, value: string) => void;
}

export function ContactFormFields({ formData, errors, onChange }: ContactFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primeiro Nome
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
          placeholder="Primeiro nome do contato"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Último Nome
        </label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Último nome do contato (opcional)"
        />
      </div>

      <PhoneInput
        value={formData.phone}
        onChange={(value) => onChange('phone', value)}
        error={errors.phone}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data de Nascimento
        </label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => onChange('birthDate', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${errors.birthDate ? 'border-red-500' : ''}`}
        />
        {errors.birthDate && (
          <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          placeholder="Observações sobre o contato..."
        />
      </div>
    </div>
  );
}